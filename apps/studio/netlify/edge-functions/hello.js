export default async (request, context) => {
  // Log the incoming request URL
  console.log('Request URL:', request.url);

  // Obtain the response from the original request
  const response = await context.next();

  // Ensure that we only modify HTML responses
  const contentType = response.headers.get('Content-Type') || '';
  console.log('Content-Type:', contentType);
  
  if (!contentType.includes('text/html')) {
    console.log('Not an HTML response, skipping modification.');
    // If it's not an HTML response, return it unmodified
    return response;
  }

  // Only continue processing if the content type is HTML
  const html = await response.text();
  const url = new URL(request.url);
  const base64 = url.searchParams.get("base64");
  console.log('Base64 parameter:', base64);

  if (base64) {
    const metaTagContent = `https://og-image-test-jiehui.netlify.app/api/og?base64=${base64}`;
    console.log('New meta tag content:', metaTagContent);
    const metaTagPattern = `/img\/meta-studio-og-image.jpeg`;
    // Seach for the meta tag in the HTML content
    const metaTagExists = html.includes(metaTagPattern);
    console.log(metaTagExists);
    const modifiedHtml = html.replace(metaTagPattern, `${metaTagContent}`);
    console.log('Modified HTML:', modifiedHtml.substring(0, 3500)); // Log the first 500 characters of the modified HTML

    return new Response(modifiedHtml, {
      // Copy over the status and headers from the original response
      status: response.status,
      headers: {
        ...response.headers,
        'Content-Type': 'text/html' // Ensure the content type is HTML
      }
    });
  } else {
    console.log('No base64 query parameter, returning original response.');
    // If no base64 query parameter, return the original response
    return response;
  }
};


export const config = { path: "/*" };
