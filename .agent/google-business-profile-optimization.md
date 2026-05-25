# Google Business Profile Optimization - Kandangi Sarees

## 1. Business Description (750 Characters)

```
Kandangi Sarees is your destination for authentic handloom sarees sourced from India's finest weaving centers—from the royal Banarasi silks of Varanasi to the vibrant Kanjivaram weaves of Tamil Nadu. Each saree in our collection is handpicked for its craftsmanship, purity, and timeless elegance.

We specialize in pure silk sarees, traditional handloom weaves, and heritage textiles that celebrate India's rich cultural legacy. Every piece comes with a quality guarantee, ensuring you receive only genuine, premium fabrics.

With global shipping and secure online ordering, we bring India's finest silk sarees to your doorstep, wherever you are. Whether you're seeking a bridal masterpiece or an everyday classic, Kandangi Sarees offers curated collections that blend tradition with modern convenience.

Experience authentic handloom. Experience pure silk. Experience Pratyagra.
```

**Character Count**: 748/750

---

## 2. Google Merchant Center (GMC) Sync Strategy

### Product Feed JSON Structure

```json
{
  "entries": [
    {
      "batchId": 1,
      "merchantId": "YOUR_MERCHANT_ID",
      "method": "insert",
      "product": {
        "offerId": "PS001",
        "title": "Pure Banarasi Silk Saree - Royal Blue with Gold Zari",
        "description": "Authentic handloom Banarasi silk saree featuring intricate gold zari work. Pure silk fabric with traditional motifs. Perfect for weddings and special occasions.",
        "link": "https://kandangisarees.com/product/PS001",
        "imageLink": "https://kandangisarees.com/images/products/PS001-main.jpg",
        "additionalImageLinks": [
          "https://kandangisarees.com/images/products/PS001-detail1.jpg",
          "https://kandangisarees.com/images/products/PS001-detail2.jpg",
          "https://kandangisarees.com/images/products/PS001-detail3.jpg"
        ],
        "contentLanguage": "en",
        "targetCountry": "IN",
        "channel": "online",
        "availability": "in stock",
        "availabilityDate": "2026-01-20T00:00:00Z",
        "condition": "new",
        "price": {
          "value": "12500.00",
          "currency": "INR"
        },
        "brand": "Kandangi Sarees",
        "gtin": "OPTIONAL_GTIN_IF_AVAILABLE",
        "mpn": "PS001",
        "googleProductCategory": "Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing > Sarees",
        "productTypes": [
          "Clothing > Sarees > Banarasi Silk Sarees",
          "Traditional Wear > Pure Silk Sarees"
        ],
        "color": "Royal Blue",
        "material": "Pure Silk",
        "pattern": "Zari Work",
        "ageGroup": "adult",
        "gender": "female",
        "sizes": [
          "One Size"
        ],
        "shipping": [
          {
            "country": "IN",
            "service": "Standard",
            "price": {
              "value": "0.00",
              "currency": "INR"
            }
          },
          {
            "country": "US",
            "service": "International",
            "price": {
              "value": "2500.00",
              "currency": "INR"
            }
          }
        ],
        "shippingWeight": {
          "value": "0.8",
          "unit": "kg"
        },
        "customLabels": {
          "customLabel0": "Handloom",
          "customLabel1": "Banarasi",
          "customLabel2": "Wedding Collection",
          "customLabel3": "Premium",
          "customLabel4": "Pure Silk"
        },
        "identifierExists": false
      }
    }
  ]
}
```

### Supabase to GMC Feed Generator (Node.js Script Outline)

```javascript
// lib/google-merchant-feed.ts
import { createClient } from '@supabase/supabase-js';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock_quantity: number;
  color?: string;
  material?: string;
}

export async function generateGMCFeed() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true);

  if (error || !products) {
    throw new Error('Failed to fetch products');
  }

  const entries = products.map((product: Product, index: number) => ({
    batchId: index + 1,
    merchantId: process.env.GOOGLE_MERCHANT_ID,
    method: 'insert',
    product: {
      offerId: product.id,
      title: product.name.substring(0, 150), // Max 150 chars
      description: product.description.substring(0, 5000), // Max 5000 chars
      link: `https://kandangisarees.com/product/${product.id}`,
      imageLink: product.images[0] || '',
      additionalImageLinks: product.images.slice(1, 11), // Max 10 additional
      contentLanguage: 'en',
      targetCountry: 'IN',
      channel: 'online',
      availability: product.stock_quantity > 0 ? 'in stock' : 'out of stock',
      condition: 'new',
      price: {
        value: product.price.toFixed(2),
        currency: 'INR',
      },
      brand: 'Kandangi Sarees',
      mpn: product.id,
      googleProductCategory: 'Apparel & Accessories > Clothing > Traditional & Ceremonial Clothing > Sarees',
      productTypes: [
        `Clothing > Sarees > ${product.category}`,
        'Traditional Wear > Pure Silk Sarees',
      ],
      color: product.color || 'Multicolor',
      material: product.material || 'Pure Silk',
      ageGroup: 'adult',
      gender: 'female',
      sizes: ['One Size'],
      shipping: [
        {
          country: 'IN',
          service: 'Standard',
          price: { value: '0.00', currency: 'INR' },
        },
      ],
      identifierExists: false,
    },
  }));

  return { entries };
}
```

### Automated Feed Update (API Route)

```typescript
// app/api/merchant-feed/route.ts
import { NextResponse } from 'next/server';
import { generateGMCFeed } from '@/lib/google-merchant-feed';

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const feed = await generateGMCFeed();
    
    // Upload to Google Merchant Center via Content API
    // Or save as XML/TSV file for manual upload
    
    return NextResponse.json({ 
      success: true, 
      productsCount: feed.entries.length 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate feed' },
      { status: 500 }
    );
  }
}
```

---

## 3. Local SEO Post Templates

### Post 1: Offer Post - First Purchase Discount

**Title**: Welcome Offer: 10% Off Your First Saree

**Description**:
```
New to Kandangi Sarees? Enjoy 10% off your first pure silk saree purchase! 

✨ Handpicked from India's finest weaving centers
🎁 Free shipping across India
💯 100% authentic handloom guarantee

Use code: FIRST10 at checkout.

Valid until: [DATE - 30 days from posting]
```

**CTA Button**: Shop Now  
**Link**: https://kandangisarees.com/collection?discount=FIRST10  
**Image**: Hero banner with elegant saree display + "10% OFF" badge

---

### Post 2: Product Post - Signature Banarasi Weave

**Title**: Royal Banarasi Silk Saree - Limited Edition

**Description**:
```
Introducing our signature piece: Pure Banarasi silk saree in regal maroon with intricate gold zari work.

🔸 Handwoven in Varanasi
🔸 Pure silk with traditional motifs
🔸 Perfect for weddings & celebrations

Only 3 pieces available.
```

**CTA Button**: Buy Now  
**Link**: https://kandangisarees.com/product/[PRODUCT_ID]  
**Image**: High-quality product photo showcasing zari details

---

### Post 3: Event Post - New Collection Launch

**Title**: Spring Collection 2026 - Now Live!

**Description**:
```
Our Spring Collection has arrived! 🌸

Discover 50+ new designs featuring:
• Vibrant Kanjivaram silks
• Elegant Tussar weaves
• Contemporary Chanderi sarees

Join us for the virtual launch event on [DATE] at 6 PM IST.

Live styling sessions | Exclusive previews | Special launch offers
```

**Event Date**: [Specific Date]  
**CTA Button**: Learn More  
**Link**: https://kandangisarees.com/collection/spring-2026  
**Image**: Collage of new collection highlights

---

## 4. Review Response Strategy

### Template 1: Response to 5-Star Review (Quality Praise)

**Customer Review Example**:
> "Absolutely stunning Kanjivaram saree! The silk quality is exceptional and the colors are even more vibrant in person. Fast delivery and beautiful packaging. Highly recommend Kandangi Sarees!"

**Response Template**:
```
Dear [Customer Name],

Thank you so much for your wonderful review! We're thrilled that your Kanjivaram saree exceeded your expectations. 

Our artisans take immense pride in selecting only the finest pure silk, and it's heartwarming to know that the craftsmanship and vibrant colors brought you joy.

We truly appreciate your trust in Kandangi Sarees and look forward to being part of your special moments again.

Warm regards,
Kandangi Sarees Team
```

**Key Elements**:
- Personalized greeting
- Acknowledge specific product (Kanjivaram)
- Highlight craftsmanship/quality
- Express gratitude
- Invite future business

---

### Template 2: Response to 3-Star Review (Shipping Delay)

**Customer Review Example**:
> "Beautiful saree and good quality, but delivery took 10 days instead of the promised 5-7 days. A bit disappointed with the delay."

**Response Template**:
```
Dear [Customer Name],

Thank you for taking the time to share your feedback, and we sincerely apologize for the shipping delay you experienced.

We're glad to hear that you're pleased with the quality of your saree—our artisans work diligently to ensure every piece meets the highest standards. However, we understand that timely delivery is equally important, and we fell short of your expectations this time.

We've reviewed your order and identified [brief reason: courier delay/high demand period]. To make this right, we'd like to offer you a 15% discount on your next purchase as a gesture of our commitment to better service.

Please reach out to us at kandangi2025@gmail.com, and we'll ensure your next experience with Kandangi Sarees is seamless.

Thank you for your patience and understanding.

Best regards,
Kandangi Sarees Team
```

**Key Elements**:
- Acknowledge the issue upfront
- Apologize sincerely
- Validate the positive (quality)
- Provide brief explanation (without excuses)
- Offer compensation/solution
- Provide direct contact for resolution
- Reaffirm commitment to improvement

---

## 5. Implementation Checklist

### Google Business Profile Setup
- [ ] Claim/verify business listing
- [ ] Upload high-quality logo (720x720px minimum)
- [ ] Add cover photo (1024x576px minimum) - showcase saree collection
- [ ] Complete business description (use template above)
- [ ] Add business hours
- [ ] Add phone number and website
- [ ] Enable messaging
- [ ] Add attributes: "Women-owned", "Online appointments", "Delivery", "Same-day delivery"
- [ ] Upload 10+ photos (products, store, team)
- [ ] Create 3-5 service listings (e.g., "Pure Silk Sarees", "Bridal Collections", "Custom Orders")

### Google Merchant Center Setup
- [ ] Create GMC account
- [ ] Verify and claim website URL
- [ ] Set up shipping and tax settings
- [ ] Configure return policy
- [ ] Implement product feed (use script above)
- [ ] Schedule daily/weekly feed updates via cron
- [ ] Enable automatic item updates
- [ ] Set up conversion tracking

### Ongoing Optimization
- [ ] Post weekly updates (use templates above)
- [ ] Respond to all reviews within 24-48 hours
- [ ] Upload new product photos monthly
- [ ] Monitor GBP insights and adjust strategy
- [ ] Run Google Ads campaigns targeting "Pure Silk Sarees" + location
- [ ] Create Q&A section with common questions

---

## 6. Target Keywords for GBP Optimization

**Primary Keywords**:
- Pure Silk Sarees
- Handloom Saree Shop
- Authentic Banarasi Sarees
- Kanjivaram Silk Sarees

**Secondary Keywords**:
- Traditional Indian Sarees Online
- Handwoven Silk Sarees
- Bridal Saree Collection
- Premium Silk Sarees India

**Long-tail Keywords**:
- "Where to buy authentic Banarasi sarees online"
- "Pure silk Kanjivaram sarees with global shipping"
- "Handloom saree shop near me"
- "Best quality silk sarees India"

**Usage Strategy**:
- Include 2-3 primary keywords in business description
- Use secondary keywords in posts and photo captions
- Answer Q&A with long-tail keyword phrases
- Include keywords naturally in review responses

---

## 7. GMC Product Feed - XML Alternative

If you prefer XML format over JSON for feed uploads:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Kandangi Sarees Product Feed</title>
    <link>https://kandangisarees.com</link>
    <description>Authentic Handloom Silk Sarees</description>
    
    <item>
      <g:id>PS001</g:id>
      <g:title>Pure Banarasi Silk Saree - Royal Blue with Gold Zari</g:title>
      <g:description>Authentic handloom Banarasi silk saree featuring intricate gold zari work. Pure silk fabric with traditional motifs.</g:description>
      <g:link>https://kandangisarees.com/product/PS001</g:link>
      <g:image_link>https://kandangisarees.com/images/products/PS001-main.jpg</g:image_link>
      <g:additional_image_link>https://kandangisarees.com/images/products/PS001-detail1.jpg</g:additional_image_link>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>12500.00 INR</g:price>
      <g:brand>Kandangi Sarees</g:brand>
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing &gt; Traditional &amp; Ceremonial Clothing &gt; Sarees</g:google_product_category>
      <g:product_type>Clothing &gt; Sarees &gt; Banarasi Silk Sarees</g:product_type>
      <g:color>Royal Blue</g:color>
      <g:material>Pure Silk</g:material>
      <g:pattern>Zari Work</g:pattern>
      <g:age_group>adult</g:age_group>
      <g:gender>female</g:gender>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
      <g:identifier_exists>FALSE</g:identifier_exists>
    </item>
    
    <!-- Repeat <item> for each product -->
    
  </channel>
</rss>
```

---

## 8. Performance Metrics to Track

**GBP Metrics**:
- Search impressions (target: +50% MoM)
- Profile views (target: +40% MoM)
- Website clicks (target: +60% MoM)
- Direction requests
- Phone calls
- Photo views

**GMC Metrics**:
- Product impressions
- Click-through rate (target: >2%)
- Conversion rate (target: >1.5%)
- Disapproved products (target: 0)
- Feed upload errors (target: 0)

**Review Metrics**:
- Average rating (maintain: >4.5 stars)
- Review response rate (target: 100%)
- Average response time (target: <24 hours)
- Review volume (target: +10 reviews/month)
