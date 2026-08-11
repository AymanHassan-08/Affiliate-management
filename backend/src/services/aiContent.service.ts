import OpenAI from "openai";
import Content from "../models/content.model.js";
import { IContent } from "../models/content.model.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  features?: string[];
  affiliateUrl?: string;
  imageUrl?: string;
}

type ContentType = "description" | "review" | "seo" | "social" | "ad" | "long-form";

function buildPrompt(product: Product, type: ContentType): string {
  const baseInfo = `
Product Name: ${product.name}
Price: $${product.price}
Category: ${product.category}
${product.description ? `Description: ${product.description}` : ""}
${product.features ? `Features: ${product.features.join(", ")}` : ""}
${product.affiliateUrl ? `Affiliate URL: ${product.affiliateUrl}` : ""}
  `.trim();

  const prompts: Record<ContentType, string> = {
    description: `Generate a compelling product description for an affiliate product. 
${baseInfo}

Create a professional, engaging product description that:
- Highlights key features and benefits
- Uses persuasive language
- Includes SEO keywords
- Calls-to-action for affiliate conversion
- Maximum 300 words

Start with a strong title on the first line, then the description.`,

    review: `Write an honest affiliate product review.
${baseInfo}

Create a detailed product review that:
- Covers pros and cons fairly
- Includes personal experience insights
- Compares to alternatives if applicable
- Includes a recommendation
- Contains affiliate disclosure
- Maximum 500 words

Start with a strong review title on the first line, then the review.`,

    seo: `Create an SEO-optimized blog post about this product for affiliate marketing.
${baseInfo}

Write a comprehensive blog post that:
- Targets relevant keywords naturally
- Includes proper SEO structure
- Provides real value to readers
- Subtly includes affiliate recommendations
- Approximately 800-1000 words
- Includes internal linking suggestions

Start with a strong SEO title on the first line, then the content.`,

    social: `Generate engaging social media posts for this product (suitable for multiple platforms).
${baseInfo}

Create 3-5 short, engaging social posts that:
- Are platform-agnostic (work on Twitter, Instagram, Facebook, etc.)
- Include relevant hashtags
- Highlight key product benefits
- Include a call-to-action
- Vary in length and tone
- Include an affiliate link or CTA

Separate each post with "---"`,

    ad: `Create compelling ad copy for this affiliate product.
${baseInfo}

Generate ad copy that:
- Hooks attention immediately
- Focuses on customer pain points
- Highlights unique selling propositions
- Includes social proof suggestions
- Ends with a strong call-to-action
- Works for ad platforms (Google Ads, Facebook Ads, etc.)
- Maximum 150 words

Start with a strong headline on the first line, then the ad body.`,

    "long-form": `Write a comprehensive long-form article featuring this product.
${baseInfo}

Create an in-depth article that:
- Explores the product category deeply
- Positions the product as a solution
- Includes industry insights
- Provides genuine value to readers
- Naturally incorporates product benefits
- Includes affiliate disclosure
- Approximately 2000+ words
- Has clear sections and headers

Start with a strong title on the first line, then the article.`,
  };

  return prompts[type];
}

export async function generateContent(
  workspaceId: string,
  product: Product,
  type: ContentType
): Promise<IContent> {
  try {
    const prompt = buildPrompt(product, type);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: type === "long-form" ? 3000 : type === "seo" ? 2000 : 1000,
    });

    const responseText = completion.choices[0].message.content || "";
    const lines = responseText.split("\n");
    const title = lines[0].trim();
    const body = lines.slice(1).join("\n").trim();

    const content = await Content.create({
      workspaceId,
      productId: product._id,
      type,
      title,
      body,
      metadata: {
        generatedAt: new Date(),
        model: "gpt-4o-mini",
        tokens: completion.usage?.total_tokens || 0,
        keywords: extractKeywords(product.name, product.category, type),
      },
    });

    return content;
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error(`Failed to generate ${type} content: ${error.message}`);
  }
}

export async function generateBatchContent(
  workspaceId: string,
  products: Product[],
  types: ContentType[]
): Promise<IContent[]> {
  const results: IContent[] = [];

  for (const product of products) {
    for (const type of types) {
      try {
        const content = await generateContent(workspaceId, product, type);
        results.push(content);

        // Rate limiting - wait 1 second between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate ${type} for product ${product._id}:`, error);
      }
    }
  }

  return results;
}

export async function regenerateContent(
  contentId: string,
  workspaceId: string
): Promise<IContent> {
  const existingContent = await Content.findOne({
    _id: contentId,
    workspaceId,
  });

  if (!existingContent) {
    throw new Error("Content not found");
  }

  if (!existingContent.productId) {
    throw new Error("Product not found for this content");
  }

  // In production, you'd fetch the product details here
  const product = {
    _id: existingContent.productId.toString(),
    name: "Product",
    price: 0,
    category: "General",
  };

  return generateContent(workspaceId, product, existingContent.type);
}

function extractKeywords(
  productName: string,
  category: string,
  type: ContentType
): string[] {
  const keywords: string[] = [productName, category];

  const typeKeywords: Record<ContentType, string[]> = {
    description: ["buy", "product", "features", "benefits"],
    review: ["review", "pros", "cons", "honest", "recommendation"],
    seo: ["guide", "best", "how to", "tips", "tutorial"],
    social: ["trending", "viral", "limited", "exclusive"],
    ad: ["sale", "offer", "discount", "limited time"],
    "long-form": ["comprehensive", "guide", "detailed", "deep dive"],
  };

  return [...keywords, ...(typeKeywords[type] || [])];
}

export async function updateContentEarnings(
  contentId: string,
  platform: string,
  earnings: number,
  conversions: number,
  clicks: number
): Promise<IContent | null> {
  const content = await Content.findById(contentId);

  if (!content) return null;

  if (!content.earnings) {
    content.earnings = {
      totalEarnings: 0,
      currency: "USD",
      lastUpdated: new Date(),
      sources: [],
    };
  }

  const existingSource = content.earnings.sources.find(
    (s) => s.platform === platform
  );

  if (existingSource) {
    existingSource.amount += earnings;
    existingSource.conversions += conversions;
    existingSource.clicks += clicks;
  } else {
    content.earnings.sources.push({
      platform,
      amount: earnings,
      conversions,
      clicks,
    });
  }

  content.earnings.totalEarnings += earnings;
  content.earnings.lastUpdated = new Date();

  return await content.save();
}
