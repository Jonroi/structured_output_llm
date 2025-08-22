import { NextResponse } from "next/server";

export async function GET() {
  const testHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Page for Element Selection</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .hero {
            text-align: center;
            margin-bottom: 40px;
        }
        .hero h1 {
            color: #333;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .hero p {
            color: #666;
            font-size: 1.2em;
            margin-bottom: 30px;
        }
        .cta-button {
            background: #3b82f6;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 5px;
            font-size: 1.1em;
            cursor: pointer;
            transition: background 0.3s;
        }
        .cta-button:hover {
            background: #2563eb;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin: 40px 0;
        }
        .feature {
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            text-align: center;
        }
        .feature h3 {
            color: #333;
            margin-bottom: 10px;
        }
        .feature p {
            color: #666;
            line-height: 1.6;
        }
        .testimonials {
            background: #f8fafc;
            padding: 40px;
            border-radius: 8px;
            margin: 40px 0;
        }
        .testimonial {
            text-align: center;
            font-style: italic;
            color: #555;
            font-size: 1.1em;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #666;
        }
        .price {
            font-size: 2em;
            color: #10b981;
            font-weight: bold;
        }
        .highlight {
            background: #fef3c7;
            padding: 2px 6px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>Welcome to Our Amazing Platform</h1>
            <p>Discover the future of digital innovation with our cutting-edge solutions</p>
            <button class="cta-button">Get Started Today</button>
        </div>

        <div class="features">
            <div class="feature">
                <h3>Feature One</h3>
                <p>This is an amazing feature that will revolutionize your workflow and boost productivity by 300%.</p>
            </div>
            <div class="feature">
                <h3>Feature Two</h3>
                <p>Another incredible feature that provides seamless integration with all your favorite tools.</p>
            </div>
            <div class="feature">
                <h3>Feature Three</h3>
                <p>The third feature that makes everything else look outdated and inefficient.</p>
            </div>
        </div>

        <div class="testimonials">
            <div class="testimonial">
                "This platform has completely transformed how we do business. The results are incredible!"
                <br><strong>- John Doe, CEO</strong>
            </div>
        </div>

        <div style="text-align: center; margin: 40px 0;">
            <h2>Special Offer</h2>
            <p>Limited time only: <span class="price">$99</span> instead of <span style="text-decoration: line-through;">$299</span></p>
            <p>Save <span class="highlight">$200</span> when you sign up today!</p>
            <button class="cta-button">Claim Your Discount</button>
        </div>

        <div class="footer">
            <p>&copy; 2024 Amazing Platform. All rights reserved.</p>
            <p>Contact us at <a href="mailto:info@amazingplatform.com">info@amazingplatform.com</a></p>
        </div>
    </div>
</body>
</html>`;

  return new NextResponse(testHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
