import https from 'https';

/**
 * Verify Google ID Token dengan Google servers
 * Menggunakan Google's tokeninfo endpoint atau library verification
 */
export async function verifyGoogleToken(idToken) {
  return new Promise((resolve) => {
    // Verify token dengan Google tokeninfo endpoint
    https.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          // Cek jika ada error
          if (parsed.error) {
            console.error('Google Token Error:', parsed.error_description);
            resolve(null);
            return;
          }

          // Verify audience (client ID) cocok dengan server
          const clientId = process.env.VITE_GOOGLE_CLIENT_ID || '';
          if (parsed.aud && clientId && !clientId.includes('your-google-client-id')) {
            if (parsed.aud !== clientId) {
              console.error('Audience mismatch:', parsed.aud, 'vs', clientId);
              resolve(null);
              return;
            }
          }

          // Verify issuer
          if (parsed.iss !== 'https://accounts.google.com' && parsed.iss !== 'accounts.google.com') {
            console.error('Invalid issuer:', parsed.iss);
            resolve(null);
            return;
          }

          // Token valid, return user info
          resolve({
            sub: parsed.sub,
            email: parsed.email,
            email_verified: parsed.email_verified,
            name: parsed.name,
            given_name: parsed.given_name,
            family_name: parsed.family_name,
            picture: parsed.picture,
            locale: parsed.locale
          });
        } catch (err) {
          console.error('Token parsing error:', err);
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.error('Token verification request error:', err);
      resolve(null);
    });
  });
}
