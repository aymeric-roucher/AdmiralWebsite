"""Simple HTTP server to view the ASCII animations."""

import http.server
import os
import socketserver

PORT = 8000


class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()


os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = MyHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"\n{'=' * 60}")
    print(f"Server running at: http://localhost:{PORT}/index.html")
    print(f"ASCII page running at: http://localhost:{PORT}/web/generator.html")
    print(f"{'=' * 60}\n")
    print("Press Ctrl+C to stop the server")
    httpd.serve_forever()
