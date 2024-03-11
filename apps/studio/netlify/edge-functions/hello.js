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
    const metaTagPattern = `<meta property="og:image:url" content="/img/meta-studio-og-image.jpeg" />`;
    const newMetaTag = `<meta property="og:image:url" content="${metaTagContent}" />`;

    html = html.replace(metaTagPattern, newMetaTag);

    console.log(`Injected meta tag for base64: ${base64}`);
  }
  else {
    console.log('nothing happend') };


  // Return the modified response
  return new Response(html, {
    ...response,
    headers: {
      ...response.headers,
      // Add any custom headers you want here
      'X-Edge-Function': 'active'
    }
  });
};

export const config = { path: "/" };
