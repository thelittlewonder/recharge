# Testing on Your Phone (Local Development)

## Quick Steps

1. **Start your dev server:**
   ```bash
   npm run dev
   ```
   You should see something like:
   ```
   VITE v5.x.x  ready in xxx ms
   ➜  Local:   http://localhost:5173/
   ➜  Network: http://192.168.x.x:5173/
   ```
   
   **Note:** The `vite.config.js` is already configured with `host: true`, so the Network URL will automatically appear. If you don't see it, make sure your firewall allows connections on port 5173.

2. **Find your computer's local IP address:**
   
   **On macOS:**
   ```bash
   ipconfig getifaddr en0
   ```
   Or check System Settings → Network → WiFi → Details
   
   **On Windows:**
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" under your active network adapter
   
   **On Linux:**
   ```bash
   hostname -I
   ```

3. **Connect your phone to the same WiFi network** as your computer

4. **Open your phone's browser** and navigate to:
   ```
   http://[YOUR_LOCAL_IP]:5173/recharge
   ```
   
   Example: `http://192.168.1.100:5173/recharge`

## Troubleshooting

- **Can't connect?** Make sure your firewall allows connections on port 5173
- **Connection refused?** Make sure Vite is showing a "Network" URL (not just Local)
- **Page loads but assets don't?** Check that you're using the `/recharge` path (not just `/`)

## Alternative: Use ngrok (for external testing)

If you need to test from outside your local network:

1. Install ngrok: `brew install ngrok` (or download from ngrok.com)
2. Start your dev server: `npm run dev`
3. In another terminal: `ngrok http 5173`
4. Use the ngrok URL on your phone (works from anywhere)

