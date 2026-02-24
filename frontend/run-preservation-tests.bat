@echo off
cd /d "%~dp0"
npx vitest run src/test/preservation-feature-buttons-enabled.test.jsx
