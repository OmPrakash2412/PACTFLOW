const { spawn, execSync } = require("child_process");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const BACKEND_DIR = path.resolve(ROOT_DIR, "backend");
const FRONTEND_DIR = path.resolve(ROOT_DIR, "frontend");

const CYAN = "\x1b[36m";
const MAGENTA = "\x1b[35m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

console.log(`${BOLD}${GREEN}==============================================================${RESET}`);
console.log(`${BOLD}${GREEN}   PACTFLOW Full-Stack Development Orchestrator${RESET}`);
console.log(`   ${CYAN}Frontend UI:${RESET} http://localhost:3000`);
console.log(`   ${CYAN}Backend API:${RESET} http://localhost:8000  (Docs: http://localhost:8000/docs)`);
console.log(`${BOLD}${GREEN}==============================================================${RESET}\n`);

// Helper to kill orphaned processes on Windows if port is busy
function freePortWindows(port) {
  if (process.platform !== "win32") return;
  try {
    execSync(
      `powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"`,
      { stdio: "ignore" }
    );
  } catch (_) {}
}

// Clean stale Next.js build cache to prevent OneDrive readlink lockouts
try {
  if (process.platform === "win32") {
    execSync(`cmd /c "rmdir /s /q "${path.join(FRONTEND_DIR, ".next")}""`, { stdio: "ignore" });
  }
} catch (_) {}

// Pre-flight port cleanup
freePortWindows(8000);
freePortWindows(3000);

let backendProc = null;
let frontendProc = null;

function prefixStream(stream, prefix, color) {
  if (!stream) return;
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (line.trim().length > 0) {
        console.log(`${color}${prefix}${RESET} ${line}`);
      }
    }
  });
}

// 1. Launch Backend (FastAPI / Uvicorn)
console.log(`${YELLOW}>> Starting Backend (FastAPI on port 8000)...${RESET}`);
const backendEnv = {
  ...process.env,
  PYTHONPATH: BACKEND_DIR,
  PYTHONUNBUFFERED: "1"
};

const pythonCmd = process.platform === "win32" ? "python" : "python3";
backendProc = spawn(
  pythonCmd,
  ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"],
  {
    cwd: BACKEND_DIR,
    env: backendEnv,
    stdio: ["ignore", "pipe", "pipe"]
  }
);

prefixStream(backendProc.stdout, "[backend] ", CYAN);
prefixStream(backendProc.stderr, "[backend] ", CYAN);

// 2. Launch Frontend (Next.js)
console.log(`${YELLOW}>> Starting Frontend (Next.js on port 3000)...${RESET}`);
const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
frontendProc = spawn(
  npmCmd,
  ["run", "dev"],
  {
    cwd: FRONTEND_DIR,
    env: process.env,
    shell: true
  }
);

prefixStream(frontendProc.stdout, "[frontend]", MAGENTA);
prefixStream(frontendProc.stderr, "[frontend]", MAGENTA);

// Clean exit handler
function cleanup() {
  console.log(`\n${YELLOW}>> Shutting down PACTFLOW services...${RESET}`);
  if (backendProc && backendProc.pid) {
    if (process.platform === "win32") {
      try { execSync(`taskkill /pid ${backendProc.pid} /T /F`, { stdio: "ignore" }); } catch (_) {}
    } else {
      backendProc.kill("SIGTERM");
    }
  }
  if (frontendProc && frontendProc.pid) {
    if (process.platform === "win32") {
      try { execSync(`taskkill /pid ${frontendProc.pid} /T /F`, { stdio: "ignore" }); } catch (_) {}
    } else {
      frontendProc.kill("SIGTERM");
    }
  }
  freePortWindows(8000);
  freePortWindows(3000);
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);
