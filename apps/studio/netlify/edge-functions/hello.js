export default async (request, context) => {
  // Obtain the response from the original request
  const response = await context.next();

  // Ensure that we only modify HTML responses
  const contentType = response.headers.get('Content-Type') || '';
  if (!contentType.includes('text/html')) {
    // If it's not an HTML response, return it unmodified
    return response;
  }

  // Only continue processing if the content type is HTML
  const html = await response.text();
  const url = new URL(request.url);
  const base64 = url.searchParams.get("base64");

  if (base64) {
    const metaTagContent = `https://og-image-test-jiehui.netlify.app/api/og?base64=${base64}`;
    const metaTagPattern = /<meta property="og:image:url" content="\/img\/meta-studio-og-image.jpeg" \/>/;
    const modifiedHtml = html.replace(metaTagPattern, `<meta property="og:image:url" content="${metaTagContent}" />`);

    return new Response(modifiedHtml, {
      // Copy over the status and headers from the original response
      status: response.status,
      headers: {
        ...response.headers,
        'Content-Type': 'text/html' // Ensure the content type is HTML
      }
    });
  }

  // If no base64 query parameter, return the original response
  return response;
};



export const config = { path: "/public/index.html" };
