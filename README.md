# AirCanvas18

A browser-based AirCanvas project that uses the webcam and MediaPipe hand tracking to let you draw in the air.

## Local run

Open `index.html` in a browser, or run a simple local web server:

```bash
python3 -m http.server 8000
```

Then visit:

```bash
http://localhost:8000
```

## Deploy on Vercel

1. Push this repo to GitHub.
2. Import the repository in Vercel.
3. Use the default static site settings.
4. Deploy.

Expected URL pattern:

```text
https://aircanvas18.vercel.app
```

## Note

This app uses the browser camera, so the webcam permission is requested from the user’s device, not from the server.
