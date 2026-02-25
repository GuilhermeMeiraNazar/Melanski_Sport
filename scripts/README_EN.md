# Server Management Scripts - Melanski Sports

Scripts to facilitate backend and frontend server management, and production deployment.

## 📁 Structure

```
scripts/
├── start.bat       # Start servers (Windows)
├── stop.bat        # Stop servers (Windows)
├── restart.bat     # Restart servers (Windows)
├── status.bat      # Check status (Windows)
├── deploy.bat      # Deploy to Hostinger (Windows)
├── start.sh        # Start servers (Linux/Mac)
├── stop.sh         # Stop servers (Linux/Mac)
├── restart.sh      # Restart servers (Linux/Mac)
├── status.sh       # Check status (Linux/Mac)
└── deploy.sh       # Deploy to Hostinger (Linux/Mac)
```

## 🚀 Production Deploy (Hostinger)

### Windows

```cmd
scripts\deploy.bat "Commit message"
```

### Linux/Mac

```bash
bash scripts/deploy.sh "Commit message"
```

What it does:
- Builds the frontend (generates files in `public_html`)
- Adds all files to Git
- Commits with the provided message
- Pushes to the repository
- Displays instructions to finalize deployment on Hostinger

**Complete deployment documentation**: See `Kiro/DEPLOY_HOSTINGER.md` and `Kiro/GUIA_RAPIDO_DEPLOY.md`

---

## 🪟 Windows

### Start Servers

```cmd
scripts\start.bat
```

What it does:
- Checks if Node.js is installed
- Installs dependencies if needed
- Starts backend on port 3000
- Starts frontend on port 5173
- Opens two separate terminal windows

### Stop Servers

```cmd
scripts\stop.bat
```

What it does:
- Stops the backend process
- Stops the frontend process
- Frees ports 3000 and 5173

### Restart Servers

```cmd
scripts\restart.bat
```

What it does:
- Executes stop.bat
- Waits 2 seconds
- Executes start.bat

### Check Status

```cmd
scripts\status.bat
```

What it does:
- Shows if backend is running
- Shows if frontend is running
- Displays process PIDs

## 🐧 Linux / Mac

### Grant Execution Permission (First time)

```bash
chmod +x scripts/*.sh
```

### Start Servers

```bash
./scripts/start.sh
```

What it does:
- Checks if Node.js and npm are installed
- Installs dependencies if needed
- Starts backend on port 3000 (background)
- Starts frontend on port 5173 (background)
- Saves PIDs to `logs/backend.pid` and `logs/frontend.pid`
- Saves logs to `logs/backend.log` and `logs/frontend.log`

### Stop Servers

```bash
./scripts/stop.sh
```

What it does:
- Stops backend process using saved PID
- Stops frontend process using saved PID
- If PID not found, tries to kill by port
- Removes .pid files

### Restart Servers

```bash
./scripts/restart.sh
```

What it does:
- Executes stop.sh
- Waits 2 seconds
- Executes start.sh

### Check Status

```bash
./scripts/status.sh
```

What it does:
- Shows if backend is running
- Shows if frontend is running
- Displays process PIDs
- Shows access URLs

## 📝 Logs (Linux/Mac)

Logs are automatically saved to:

```
logs/
├── backend.log     # Backend server output
├── frontend.log    # Frontend server output
├── backend.pid     # Backend process PID
└── frontend.pid    # Frontend process PID
```

To view logs in real-time:

```bash
# Backend
tail -f logs/backend.log

# Frontend
tail -f logs/frontend.log
```

## 🔧 Requirements

- Node.js (v14 or higher)
- npm (v6 or higher)
- Windows: PowerShell or CMD
- Linux/Mac: Bash

## 🚀 Access URLs

After starting the servers:

- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173

## ⚠️ Troubleshooting

### Port already in use

If ports 3000 or 5173 are already in use:

**Windows:**
```cmd
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Kill the process (replace PID with the number found)
taskkill /F /PID <PID>
```

**Linux/Mac:**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :5173

# Kill the process
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:5173)
```

### Permission denied (Linux/Mac)

```bash
chmod +x scripts/*.sh
```

### Node.js not found

Install Node.js: https://nodejs.org/

## 💡 Tips

1. **Development**: Use `start` to launch both servers
2. **Production**: Configure PM2 or similar for advanced management
3. **Logs**: Always check logs if something doesn't work
4. **Status**: Use `status` to verify everything is running

## 🔄 Recommended Workflow

```bash
# 1. Start for the first time
./scripts/start.sh

# 2. Check if everything is ok
./scripts/status.sh

# 3. Make code changes...

# 4. Restart to apply changes
./scripts/restart.sh

# 5. Stop when finished
./scripts/stop.sh
```

## 📋 Quick Reference

| Action | Windows | Linux/Mac |
|--------|---------|-----------|
| Start | `scripts\start.bat` | `./scripts/start.sh` |
| Stop | `scripts\stop.bat` | `./scripts/stop.sh` |
| Restart | `scripts\restart.bat` | `./scripts/restart.sh` |
| Status | `scripts\status.bat` | `./scripts/status.sh` |
| Deploy | `scripts\deploy.bat "message"` | `bash scripts/deploy.sh "message"` |

## 🎯 Features

### START Script
- ✅ Verifies Node.js installation
- ✅ Auto-installs dependencies
- ✅ Starts backend (port 3000)
- ✅ Starts frontend (port 5173)
- ✅ Windows: Opens separate windows
- ✅ Linux/Mac: Runs in background with logs

### STOP Script
- ✅ Gracefully stops backend
- ✅ Gracefully stops frontend
- ✅ Frees ports 3000 and 5173
- ✅ Removes PID files (Linux/Mac)

### RESTART Script
- ✅ Stops servers
- ✅ Waits 2 seconds
- ✅ Starts servers again

### STATUS Script
- ✅ Shows backend status
- ✅ Shows frontend status
- ✅ Displays process PIDs
- ✅ Shows access URLs

## 🔐 Security Notes

- Scripts run with current user permissions
- No elevated privileges required
- Logs may contain sensitive information (Linux/Mac)
- PID files are temporary and auto-cleaned

## 🐛 Common Issues

### Issue: "Node.js not found"
**Solution**: Install Node.js from https://nodejs.org/

### Issue: "Port already in use"
**Solution**: Stop the conflicting process or use the stop script

### Issue: "Permission denied" (Linux/Mac)
**Solution**: Run `chmod +x scripts/*.sh`

### Issue: "Cannot find module"
**Solution**: Delete `node_modules` folders and run start script again

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [npm Documentation](https://docs.npmjs.com/)
- [Express.js Guide](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)

## 🤝 Contributing

If you improve these scripts, please:
1. Test on your platform
2. Update this documentation
3. Add comments to the code
4. Consider cross-platform compatibility

## 📄 License

These scripts are part of the Melanski Sports project.

---

**Need help?** Check the troubleshooting section or contact the development team.
