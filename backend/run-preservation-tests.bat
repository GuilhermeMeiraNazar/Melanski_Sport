@echo off
cd /d "%~dp0"
npm test -- preservationProperties.test.js
