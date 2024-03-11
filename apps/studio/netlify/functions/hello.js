// hello.js
exports.handler = async (event) => {
  const params = event.queryStringParameters;
  const base64 = params.base64; // Extract your base64 or any other parameter.
  
  // Generate your meta tag dynamically
  const metaTagContent = `https://og-image-test-jiehui.netlify.app/api/og?base64=${base64}`;
  
  // Your HTML template with the dynamic meta tag
  const htmlResponse = `
    <html>
      <head>
        <meta property="og:image:url" content="${metaTagContent}" />
        <!-- Add other meta tags and HTML content as needed -->
      </head>
      <body>
        <!-- Your page content -->
      </body>
    </html>
  `;
  
  return {
    statusCode: 200,
    headers: {'Content-Type': 'text/html'},
    body: htmlResponse
  };
};
