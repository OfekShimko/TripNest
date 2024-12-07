#!/bin/bash

# Run the netstat command in PowerShell to find the PID of the process using port 3000
netstat_output=$(powershell.exe -Command "netstat -ano | findstr ':3000'")

# Print the output for debugging purposes
echo "Netstat output: $netstat_output"

# Extract the PID from the netstat output
PID=$(echo $netstat_output | tr -d '\r' | tr -s ' ' | awk '{print $5}' | grep -o '[0-9]*')

# Check if a PID was found
if [ -n "$PID" ]; then
  echo "Killing process using port 3000 (PID: $PID)..."
  
  # Run taskkill in PowerShell to terminate the process
  powershell.exe -Command "taskkill /PID $PID /F"
  echo "Process killed."
else
  echo "No process is using port 3000."
fi
