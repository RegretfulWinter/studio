export default async (request, context) => {
  console.log('Request URL:', request.url);

  // Obtain the response from the original request
  const originalResponse = await context.next();

  // Clone the response so we can safely read the body
  const response = originalResponse.clone();

  const contentType = response.headers.get('Content-Type') || '';
  console.log('Content-Type:', contentType);

  if (!contentType.includes('text/html')) {
    console.log('Not an HTML response, skipping modification.');
    return originalResponse;
  }

  const html = await response.text(); // Read from the cloned response
  const url = new URL(request.url);
  const base64 = url.searchParams.get("base64");
  console.log('Base64 parameter:', base64);

  const width = "1200"; // Specify the width
  const height = "630"; // Specify the height
  
  const widthMetaTag = `<meta property="og:image:width" content="${width}">`;
  const heightMetaTag = `<meta property="og:image:height" content="${height}">`;

  if (base64) {
    const metaTagContent = `https://og-image-test-jiehui.netlify.app/api/og?base64=${base64}`;
    console.log('New meta tag content:', metaTagContent);
    const metaTagPattern = `/img\/meta-studio-og-image.jpeg`;
    const metaTagExists = html.includes(metaTagPattern);
    console.log(metaTagExists);
    let modifiedHtml = html.replace(metaTagPattern, `${metaTagContent}`);
    modifiedHtml = modifiedHtml.replace('</head>', `${widthMetaTag}\n${heightMetaTag}\n</head>`);
    // Log part of the modified HTML for debugging (avoid logging the whole content to prevent excessive log size)
    console.log('Modified HTML:', modifiedHtml.substring(0, 5000));

    return new Response(modifiedHtml, {
      status: originalResponse.status,
      headers: {
        ...originalResponse.headers,
        'Content-Type': 'text/html'
      }
    });
  } else {
    console.log('No base64 query parameter, returning original response.');
    return originalResponse;
  }
};

export const config = { path: "/*" };
