export default async (request, context) => {
  // Access query parameters
  const url = new URL(request.url);
  const base64 = url.searchParams.get("base64");

  // Modify the HTML response
  const response = await context.next();
  let html = await response.text();

  // Replace placeholder or append to the HTML
  if (base64) {
    const metaTagContent = `https://og-image-test-jiehui.netlify.app/api/og?base64=${base64}`;
    html = html.replace(
      '<head>',
      `<head><meta property="og:image:url" content="${metaTagContent}">`
    );
  }

  // Return the modified response
  return new Response(html, response);
};
