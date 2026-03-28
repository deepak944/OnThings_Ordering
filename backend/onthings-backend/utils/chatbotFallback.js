const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const formatCurrency = (value) => `Rs.${Number(value || 0).toLocaleString('en-IN')}`;

const websiteSummary =
  'OnThings is an e-commerce website for shopping across mobiles, electronics, laptops, footwear, TV, wearables, cameras, gaming, and accessories.';

const supportedPages = [
  'Home',
  'Login',
  'Signup',
  'Forgot Password',
  'Cart',
  'Checkout',
  'My Orders',
  'Order Tracking'
];

const orderStatuses = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
const paymentMethods = ['Cash on Delivery', 'Credit or Debit Card via Razorpay'];

const ignoredQueryWords = new Set([
  'a',
  'an',
  'and',
  'are',
  'can',
  'do',
  'for',
  'how',
  'i',
  'is',
  'me',
  'my',
  'of',
  'on',
  'or',
  'the',
  'to',
  'what',
  'which',
  'with',
  'you',
  'your',
  'where'
]);

const generalKnowledgeBase = [
  {
    keywords: ['who are you', 'your name', 'what are you'],
    answer:
      'I am the OnThings support assistant. I can help with this website, navigation, products, orders, payments, account access, and some simple general questions.',
    confidence: 0.9
  },
  {
    keywords: ['thank you', 'thanks', 'thx'],
    answer: 'You are welcome. If you want, ask me where a button is, how checkout works, or which products are available.',
    confidence: 0.9
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    answer:
      'Hi! I can help with this website, where buttons are, how checkout works, products, orders, payments, password reset, and simple general questions.',
    confidence: 0.92
  },
  {
    keywords: ['joke', 'funny'],
    answer:
      'Here is one: Why did the online shopper sit near the router? Because they wanted a stronger connection to their cart.',
    confidence: 0.76
  },
  {
    keywords: ['what is ai', 'artificial intelligence', 'machine learning'],
    answer:
      'Artificial intelligence is software designed to perform tasks that normally need human-like reasoning, such as answering questions, recognizing patterns, or making predictions.',
    confidence: 0.72
  }
];

const pageLocations = [
  {
    keywords: ['login button', 'login', 'sign in'],
    answer:
      'On desktop, the Login button is in the top-right area of the blue navbar. On mobile, tap the menu icon at the top-right and you will see Login in the slide-down menu.',
    confidence: 0.95
  },
  {
    keywords: ['sign up', 'signup button', 'register'],
    answer:
      'The Sign Up button is in the top-right area of the blue navbar next to Login on desktop. On mobile, open the top-right menu icon and you will see Sign Up there.',
    confidence: 0.94
  },
  {
    keywords: ['cart button', 'cart', 'shopping cart'],
    answer:
      'The Cart button is on the right side of the top blue navbar. It shows a cart icon and item count. On mobile, it is also available inside the top-right menu.',
    confidence: 0.94
  },
  {
    keywords: ['search bar', 'search box', 'search'],
    answer:
      'The search bar is centered in the top blue navbar on desktop. On mobile, it appears just below the navbar at the top of the page.',
    confidence: 0.92
  },
  {
    keywords: ['my orders', 'orders page'],
    answer:
      'My Orders is available after login. On desktop, it appears in the top-right navbar. On mobile, open the top-right menu to find My Orders.',
    confidence: 0.9
  },
  {
    keywords: ['forgot password', 'reset password'],
    answer:
      'From the Login page, use the Forgot Password link below the password field area. It opens the password reset flow where you can generate a reset token and then set a new password.',
    confidence: 0.92
  },
  {
    keywords: ['place order button', 'proceed to checkout', 'checkout button'],
    answer:
      'In Cart, the Proceed to Checkout button is in the right-side order summary card. On the Checkout page, the orange Place Order button is at the bottom of the right-side order summary panel.',
    confidence: 0.91
  }
];

const toProductSummary = (product) => ({
  id: product.id,
  name: product.name || product.title || '',
  category: product.category || 'General',
  price: Number(product.price || 0),
  rating: Number(product.rating || 0),
  reviews: Number(product.reviews || 0),
  description: product.description || ''
});

const listCategories = (products) => [...new Set(products.map((product) => product.category).filter(Boolean))];

const personalize = (answer, session, options = {}) => {
  if (!session?.name) {
    return answer;
  }

  if (options.useGreeting) {
    return `${session.name}, ${answer.charAt(0).toLowerCase()}${answer.slice(1)}`;
  }

  if (options.useWarmIntro) {
    return `${session.name}, ${answer}`;
  }

  return answer;
};

const scoreProductMatches = (query, products) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return [];
  }

  const queryWords = normalizedQuery
    .split(' ')
    .filter((word) => word.length > 2 && !ignoredQueryWords.has(word));

  return products
    .map((product) => {
      const haystack = normalize(`${product.name} ${product.category} ${product.description}`);
      let score = 0;

      for (const word of queryWords) {
        if (haystack.includes(word)) {
          score += word.length > 3 ? 2 : 1;
        }
      }

      if (normalize(product.name) && normalizedQuery.includes(normalize(product.name))) {
        score += 6;
      }

      if (normalize(product.category) && normalizedQuery.includes(normalize(product.category))) {
        score += 4;
      }

      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (right.product.rating !== left.product.rating) {
        return right.product.rating - left.product.rating;
      }
      return left.product.price - right.product.price;
    });
};

const buildNameReply = (query, session) => {
  const normalizedQuery = normalize(query);

  if (normalizedQuery.includes('what is my name') || normalizedQuery.includes('do you know my name')) {
    if (session?.name) {
      return {
        answer: `Your name is ${session.name}. I will keep using it in this chat session.`,
        confidence_score: 0.96
      };
    }

    return {
      answer: 'I do not know your name yet. You can tell me by saying something like "my name is Deepak".',
      confidence_score: 0.9
    };
  }

  return null;
};

const buildWebsiteReply = (query, products, session) => {
  const normalizedQuery = normalize(query);
  const categories = listCategories(products);

  const locationMatch = pageLocations.find((entry) =>
    entry.keywords.some((keyword) => normalizedQuery.includes(normalize(keyword)))
  );

  if (
    locationMatch &&
    (normalizedQuery.includes('where') ||
      normalizedQuery.includes('exactly') ||
      normalizedQuery.includes('button') ||
      normalizedQuery.includes('find') ||
      normalizedQuery.includes('locate'))
  ) {
    return {
      answer: personalize(locationMatch.answer, session, { useWarmIntro: true }),
      confidence_score: locationMatch.confidence
    };
  }

  if (
    normalizedQuery.includes('payment') ||
    normalizedQuery.includes('pay') ||
    normalizedQuery.includes('how can i pay') ||
    normalizedQuery.includes('payment method') ||
    normalizedQuery.includes('razorpay') ||
    normalizedQuery.includes('cod') ||
    normalizedQuery.includes('cash on delivery')
  ) {
    return {
      answer: personalize(
        `OnThings supports ${paymentMethods.join(
          ' and '
        )}. On the Checkout page, first fill the shipping address form on the left, then choose your payment option in the Payment Method section. If you choose Cash on Delivery, the order is created directly when you click Place Order. If you choose card payment, the orange Place Order button opens Razorpay, and after successful payment the backend verifies it before the success page opens.`,
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.96
    };
  }

  if (
    normalizedQuery.includes('website') ||
    normalizedQuery.includes('site') ||
    normalizedQuery.includes('platform') ||
    normalizedQuery.includes('what is onthings') ||
    normalizedQuery.includes('about onthings') ||
    normalizedQuery.includes('what do you sell')
  ) {
    return {
      answer: personalize(
        `${websiteSummary} You can browse categories like ${categories.slice(0, 6).join(', ')}${
          categories.length > 6 ? ', and more' : ''
        }, add items to cart, checkout, and track your orders after login.`,
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.91
    };
  }

  if (
    normalizedQuery.includes('feature') ||
    normalizedQuery.includes('what can i do') ||
    normalizedQuery.includes('how to use') ||
    normalizedQuery.includes('pages')
  ) {
    return {
      answer: personalize(
        `OnThings supports these main pages: ${supportedPages.join(
          ', '
        )}. You can search products, filter by category, add items to cart, place orders, reset passwords, and track previous purchases.`,
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.88
    };
  }

  if (normalizedQuery.includes('category') || normalizedQuery.includes('categories')) {
    return {
      answer: personalize(
        `Current shopping categories include ${categories.join(
          ', '
        )}. You can browse them from the home page filters.`,
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.88
    };
  }

  if (
    normalizedQuery.includes('checkout') ||
    normalizedQuery.includes('how to order') ||
    normalizedQuery.includes('buy now') ||
    normalizedQuery.includes('place order')
  ) {
    return {
      answer: personalize(
        'To place an order, add a product to cart or use Buy Now, open Cart, click Proceed to Checkout, fill in shipping details, choose the payment method, and then click the orange Place Order button in the order summary on the right.',
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.93
    };
  }

  if (
    normalizedQuery.includes('login') ||
    normalizedQuery.includes('sign in') ||
    normalizedQuery.includes('signup') ||
    normalizedQuery.includes('sign up') ||
    normalizedQuery.includes('account')
  ) {
    return {
      answer: personalize(
        'You can create an account from the Signup page, log in from the Login page, and use Forgot Password if you cannot access your account.',
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.85
    };
  }

  if (
    normalizedQuery.includes('forgot password') ||
    normalizedQuery.includes('reset password') ||
    normalizedQuery.includes('change password')
  ) {
    return {
      answer: personalize(
        'Use the Forgot Password page to generate a reset token, then open Reset Password, paste the token, and choose a new password.',
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.92
    };
  }

  if (normalizedQuery.includes('cart')) {
    return {
      answer: personalize(
        'The cart page shows all selected products, quantity controls, price summary, delivery charge, and the Proceed to Checkout button in the order summary card on the right.',
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.89
    };
  }

  if (
    normalizedQuery.includes('order') ||
    normalizedQuery.includes('track') ||
    normalizedQuery.includes('tracking') ||
    normalizedQuery.includes('my orders')
  ) {
    return {
      answer: personalize(
        `After login, you can open My Orders to view previous purchases and Order Tracking to follow the current status. Orders move through ${orderStatuses.join(
          ', '
        )}.`,
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.88
    };
  }

  if (
    normalizedQuery.includes('shipping') ||
    normalizedQuery.includes('delivery') ||
    normalizedQuery.includes('free delivery')
  ) {
    return {
      answer: personalize(
        'The website highlights free delivery on orders above Rs.500. Shipping updates are shown through order status steps such as Processing, Shipped, Out for Delivery, and Delivered.',
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.83
    };
  }

  return null;
};

const buildProductReply = (query, products, session) => {
  const normalizedQuery = normalize(query);
  if (!products.length) {
    return null;
  }

  const scoredMatches = scoreProductMatches(query, products);
  const matches = scoredMatches.slice(0, 3).map((entry) => entry.product);
  const strongestScore = scoredMatches[0]?.score || 0;
  const categories = listCategories(products).map((category) => normalize(category));
  const hasCatalogIntent =
    normalizedQuery.includes('product') ||
    normalizedQuery.includes('products') ||
    normalizedQuery.includes('price') ||
    normalizedQuery.includes('cost') ||
    normalizedQuery.includes('buy') ||
    normalizedQuery.includes('show') ||
    normalizedQuery.includes('recommend') ||
    normalizedQuery.includes('suggest') ||
    normalizedQuery.includes('available') ||
    normalizedQuery.includes('catalog') ||
    categories.some((category) => normalizedQuery.includes(category));

  if (
    normalizedQuery.includes('cheap') ||
    normalizedQuery.includes('lowest price') ||
    normalizedQuery.includes('budget')
  ) {
    const cheapest = [...products].sort((left, right) => left.price - right.price)[0];
    return {
      answer: personalize(
        `One of the most budget-friendly products right now is ${cheapest.name} in ${cheapest.category} for ${formatCurrency(
          cheapest.price
        )}.`,
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.82
    };
  }

  if (
    normalizedQuery.includes('best') ||
    normalizedQuery.includes('top rated') ||
    normalizedQuery.includes('highest rated')
  ) {
    const bestRated = [...products].sort((left, right) => {
      if (right.rating !== left.rating) {
        return right.rating - left.rating;
      }
      return right.reviews - left.reviews;
    })[0];

    return {
      answer: personalize(
        `${bestRated.name} is one of the top-rated products with a rating of ${bestRated.rating} and about ${bestRated.reviews} reviews.`,
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.82
    };
  }

  if (!matches.length || (!hasCatalogIntent && strongestScore < 5)) {
    return null;
  }

  if (normalizedQuery.includes('price') && matches.length === 1) {
    const product = matches[0];
    return {
      answer: personalize(
        `${product.name} is listed at ${formatCurrency(product.price)} in the ${product.category} category.`,
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.88
    };
  }

  if (
    normalizedQuery.includes('recommend') ||
    normalizedQuery.includes('suggest') ||
    normalizedQuery.includes('which product') ||
    normalizedQuery.includes('show')
  ) {
    return {
      answer: personalize(
        `Here are some relevant products from OnThings: ${matches
          .map((product) => `${product.name} (${formatCurrency(product.price)})`)
          .join(', ')}.`,
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.86
    };
  }

  if (matches.length === 1) {
    const product = matches[0];
    return {
      answer: personalize(
        `${product.name} is available on OnThings in the ${product.category} category for ${formatCurrency(
          product.price
        )}. It has a rating of ${product.rating} with about ${product.reviews} reviews.`,
        session,
        { useWarmIntro: true }
      ),
      confidence_score: 0.84
    };
  }

  return {
    answer: personalize(
      `I found these relevant products on OnThings: ${matches
        .map((product) => `${product.name} (${formatCurrency(product.price)})`)
        .join(', ')}.`,
      session,
      { useWarmIntro: true }
    ),
    confidence_score: 0.8
  };
};

const buildGeneralReply = (query, session) => {
  const normalizedQuery = normalize(query);
  const matched = generalKnowledgeBase.find((entry) =>
    entry.keywords.some((keyword) => normalizedQuery.includes(normalize(keyword)))
  );

  if (matched) {
    return {
      answer: personalize(matched.answer, session, { useWarmIntro: true }),
      confidence_score: matched.confidence
    };
  }

  return null;
};

const buildOutOfScopeReply = (session) => ({
  answer: personalize(
    'I can answer detailed OnThings website questions like where buttons are, how checkout works, payment flow, products, orders, and account access. I can also handle a few simple general questions, but I do not have full live knowledge for every topic.',
    session,
    { useWarmIntro: true }
  ),
  confidence_score: 0.62
});

const buildFallbackChatbotReply = (query, options = {}) => {
  const products = Array.isArray(options.products) ? options.products.map(toProductSummary) : [];
  const session = options.session || null;

  const nameReply = buildNameReply(query, session);
  if (nameReply) {
    return {
      ...nameReply,
      source: 'fallback'
    };
  }

  const websiteReply = buildWebsiteReply(query, products, session);
  if (websiteReply) {
    return {
      ...websiteReply,
      source: 'fallback'
    };
  }

  const productReply = buildProductReply(query, products, session);
  if (productReply) {
    return {
      ...productReply,
      source: 'fallback'
    };
  }

  const generalReply = buildGeneralReply(query, session);
  if (generalReply) {
    return {
      ...generalReply,
      source: 'fallback'
    };
  }

  return {
    ...buildOutOfScopeReply(session),
    source: 'fallback'
  };
};

module.exports = { buildFallbackChatbotReply };
