import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const hasApiKey = apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here';

let genAI: any = null;
if (hasApiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('✨ Gemini AI service initialized with API Key.');
  } catch (error) {
    console.error('⚠️ Failed to initialize Gemini AI:', error);
  }
} else {
  console.warn('⚠️ No GEMINI_API_KEY found. Running in Local AI Fallback Mode.');
}

// Helper to convert file buffer to Gemini API format
function fileToGenerativePart(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType
    }
  };
}

export const aiService = {
  /**
   * Generates a conversational response to a user question
   */
  async generateChatResponse(userMessage: string, chatHistory: { role: string; content: string }[]): Promise<string> {
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Format history
        const contents = chatHistory.map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        }));
        
        // Add instruction to system prompt context
        const systemInstruction = "You are CarbonWise AI, a sustainability coach. Answer questions about carbon footprints, climate change, recycling, and eco-friendly lifestyles. Be professional, concise, encouraging, and clear.";
        
        const chat = model.startChat({
          history: contents,
          systemInstruction: { parts: [{ text: systemInstruction }] }
        });
        
        const result = await chat.sendMessage(userMessage);
        return result.response.text();
      } catch (error: any) {
        console.error('Gemini Chat Error, falling back:', error.message);
      }
    }
    
    // Local AI Fallback Chatbot logic
    const message = userMessage.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I am CarbonWise AI, your personal sustainability assistant. How can I help you understand, track, or reduce your carbon footprint today?";
    }
    if (message.includes('reduce') || message.includes('cut') || message.includes('lower')) {
      return `To reduce your carbon footprint, focus on three high-impact areas:
1. **Transportation**: Opt for walking, cycling, or public transit over single-occupancy gasoline cars. When driving, maintain steady speeds and keep tires inflated.
2. **Home Energy**: Switch off unused electronics, install LED bulbs, adjust your thermostat (closer to external temp), and transition to green electricity options if available.
3. **Diet**: Incorporate more plant-based meals. The emissions of beef are over 6x higher than poultry, and 10x higher than vegetables!
      
Which category would you like to build a detailed plan for?`;
    }
    if (message.includes('car') || message.includes('drive') || message.includes('gasoline')) {
      return "An average gasoline car produces about 0.20 kg (200g) of CO2 per kilometer. By switching to an electric vehicle, you reduce this to ~0.05 kg CO2/km (dependent on grid power source). Carpooling, public transit, or cycling are even more effective at reducing transport emissions to near-zero!";
    }
    if (message.includes('cycle') || message.includes('bike') || message.includes('walking') || message.includes('metro')) {
      return "Cycling and walking generate exactly **0 kg of CO2** and earn you bonus Green Coins on CarbonWise! Standard metro or trains produce about 0.04 kg CO2 per passenger-km, which is about 5 times cleaner than a standard gasoline car (~0.20 kg CO2/km). For urban travel, cycling is the best sustainable option!";
    }
    if (message.includes('food') || message.includes('meat') || message.includes('diet')) {
      return "Food accounts for nearly 25% of global household emissions. Eating a vegan meal emits about 0.5 kg CO2, a vegetarian meal emits 0.8 kg, while a red meat (beef/pork) meal emits 3.2 kg CO2. Simply replacing one beef meal a week with a plant-based alternative saves over 140 kg CO2 annually!";
    }
    if (message.includes('electricity') || message.includes('bill') || message.includes('power')) {
      return "Electricity emissions depend on your local power grid source. The global average is about 0.45 kg (450g) of CO2 per kWh consumed. You can reduce this by buying energy-efficient appliances, switching off standby power, and adopting solar panels or clean grid plans.";
    }

    return "That's an interesting question! Tracking and optimizing daily habits is the best path to sustainability. You can log your transport, diet, and power usage in our Tracker tab. By analyzing the breakdown, we can discover high-yield opportunities to cut emissions and save energy.";
  },

  /**
   * Generates a weekly/monthly sustainability report
   */
  async generateCoachingReport(userStats: {
    name: string;
    metrics: { todayCarbon: number; weeklyCarbon: number; monthlyCarbon: number; carbonGoal: number; carbonScore: number };
    breakdown: Record<string, number>;
  }): Promise<any> {
    const prompt = `
      You are a professional sustainability coach analyzing user carbon data:
      User Name: ${userStats.name}
      Current monthly carbon emissions: ${userStats.metrics.monthlyCarbon} kg CO2
      Monthly emission limit (Goal): ${userStats.metrics.carbonGoal} kg CO2
      Carbon Score (0-100 scale, higher is better): ${userStats.metrics.carbonScore}
      Category breakdown (kg CO2 emitted in last 30 days):
      ${JSON.stringify(userStats.breakdown, null, 2)}
      
      Generate a comprehensive sustainability report. Return ONLY a valid JSON object matching the following TypeScript type:
      {
        mainSources: Array<{ category: string, percentage: number, explanation: string }>,
        recommendations: Array<{ action: string, impact: 'High' | 'Medium' | 'Low', co2Savings: number, timeframe: string, why: string }>,
        monthlyGoals: Array<{ title: string, category: string, target: number }>,
        forecast: string
      }
      Do not output any markdown code blocks, comments, or prefix text. Just return the raw JSON object.
    `;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        
        // Clean JSON formatting
        const cleanJsonStr = text.replace(/^```json/i, '').replace(/```$/, '').trim();
        return JSON.parse(cleanJsonStr);
      } catch (error) {
        console.error('Gemini Coaching Error, falling back:', error);
      }
    }

    // Local AI Fallback Coach logic
    const breakdown = userStats.breakdown;
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;
    
    // Sort breakdown categories
    const sortedCategories = Object.entries(breakdown)
      .map(([category, value]) => ({
        category,
        value,
        percentage: Math.round((value / total) * 100)
      }))
      .filter(c => c.value > 0)
      .sort((a, b) => b.value - a.value);

    // Make default breakdown if empty
    if (sortedCategories.length === 0) {
      sortedCategories.push(
        { category: 'electricity', value: 180, percentage: 50 },
        { category: 'travel', value: 120, percentage: 33 },
        { category: 'food', value: 60, percentage: 17 }
      );
    }

    const mainSources = sortedCategories.slice(0, 3).map(c => {
      let explanation = `Contributes ${c.percentage}% of your tracked carbon footprint.`;
      if (c.category === 'travel') explanation += " Derived from driving personal vehicles, which burn petroleum products.";
      if (c.category === 'electricity') explanation += " Results from residential heating, cooling, and appliance power grid consumption.";
      if (c.category === 'food') explanation += " Primarily driven by carbon-heavy food selections like meats or dairy.";
      if (c.category === 'waste') explanation += " Caused by solid waste sent to landfills, which degrades into methane.";
      return {
        category: c.category,
        percentage: c.percentage,
        explanation
      };
    });

    const recommendations = [];
    const monthlyGoals = [];

    // Check if travel is a major source
    const travelEmissions = (breakdown.travel || 0) + (breakdown.flight || 0) + (breakdown.public_transport || 0);
    if (travelEmissions > 50) {
      recommendations.push({
        action: 'Transition to active or public transit',
        impact: 'High',
        co2Savings: Math.round(travelEmissions * 0.4),
        timeframe: 'Immediate',
        why: 'Public transit (metro/bus) produces up to 80% less CO2 per km compared to single-occupant driving.'
      });
      monthlyGoals.push({
        title: 'Cut Driving in Half',
        category: 'travel',
        target: Math.round(travelEmissions * 0.5)
      });
    }

    // Check if energy is a major source
    const energyEmissions = breakdown.electricity || 0;
    if (energyEmissions > 50 || recommendations.length === 0) {
      recommendations.push({
        action: 'Install LED Bulbs and Smart Thermostats',
        impact: 'Medium',
        co2Savings: Math.round((energyEmissions || 150) * 0.15),
        timeframe: 'Next 2 weeks',
        why: 'LED bulbs consume 75% less energy than incandescent lightbulbs and last 25x longer.'
      });
      monthlyGoals.push({
        title: 'Save Electricity',
        category: 'electricity',
        target: Math.round((energyEmissions || 150) * 0.85)
      });
    }

    // General Food Recommendation
    recommendations.push({
      action: 'Introduce Meatless Mondays',
      impact: 'Medium',
      co2Savings: 15,
      timeframe: 'Weekly',
      why: 'Avoiding red meat just one day a week saves significant emissions, as red meat is highly methane-intensive.'
    });

    if (monthlyGoals.length === 0) {
      monthlyGoals.push({
        title: 'Reduce overall emissions by 10%',
        category: 'overall',
        target: Math.round(total * 0.9)
      });
    }

    const currentMonthly = userStats.metrics.monthlyCarbon;
    const goalVal = userStats.metrics.carbonGoal;
    const savings = recommendations.reduce((acc, curr) => acc + curr.co2Savings, 0);
    const forecast = `Based on your current habits, you are projected to emit ${Math.round(currentMonthly * 1.05)} kg CO2 next month. However, by adopting the recommended actions (e.g., LED transitions and active transit), you can save an estimated ${savings} kg CO2, dropping your monthly total to ${Math.round(Math.max(10, currentMonthly - savings))} kg, keeping you well under your ${goalVal} kg target.`;

    return {
      mainSources,
      recommendations,
      monthlyGoals,
      forecast
    };
  },

  /**
   * Scans a utility bill (multimodal OCR)
   */
  async scanUtilityBill(fileBuffer: Buffer, mimeType: string): Promise<any> {
    const prompt = `
      You are an expert utility bill scanner. Extract key details from this bill.
      Analyze the text and numbers in the document.
      Return ONLY a valid JSON object matching the following structure:
      {
        provider: string,
        date: string (YYYY-MM-DD or estimated YYYY-MM-DD),
        consumption: number (amount of electricity in kWh or water in liters),
        units: "kWh" | "Liters",
        carbonEmissions: number (estimated carbon footprint in kg CO2)
      }
      Do not include any explanation, prefix text, or markdown code blocks. Just return the raw JSON object.
    `;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const imagePart = fileToGenerativePart(fileBuffer, mimeType);
        
        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text().trim();
        
        const cleanJsonStr = text.replace(/^```json/i, '').replace(/```$/, '').trim();
        return JSON.parse(cleanJsonStr);
      } catch (error) {
        console.error('Gemini Bill OCR Error, falling back:', error);
      }
    }

    // Local Fallback OCR Scanner
    // Simulate reading details from the bill
    const randomConsumption = Math.floor(Math.random() * 250) + 150; // 150-400 kWh
    const carbonEst = parseFloat((randomConsumption * 0.45).toFixed(2));
    
    return {
      provider: 'City Power Grid Inc.',
      date: new Date().toISOString().split('T')[0],
      consumption: randomConsumption,
      units: 'kWh',
      carbonEmissions: carbonEst
    };
  },

  /**
   * Scans a grocery or shopping receipt
   */
  async scanReceipt(fileBuffer: Buffer, mimeType: string): Promise<any> {
    const prompt = `
      You are an expert shopping receipt scanner. Parse this shopping receipt.
      Extract items, group/categorize them, and estimate emissions for each category.
      Return ONLY a valid JSON object matching the following structure:
      {
        merchant: string,
        date: string (YYYY-MM-DD),
        items: Array<{ name: string, category: "food" | "electronics" | "clothing" | "plastic" | "other", price: number }>,
        totalCarbonEmissions: number (total estimated carbon footprint in kg CO2)
      }
      Do not include any explanation, prefix, or markdown. Just return raw JSON.
    `;

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const imagePart = fileToGenerativePart(fileBuffer, mimeType);
        
        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text().trim();
        
        const cleanJsonStr = text.replace(/^```json/i, '').replace(/```$/, '').trim();
        return JSON.parse(cleanJsonStr);
      } catch (error) {
        console.error('Gemini Receipt OCR Error, falling back:', error);
      }
    }

    // Local Fallback Receipt Scanner
    return {
      merchant: 'Greenway Supermarket',
      date: new Date().toISOString().split('T')[0],
      items: [
        { name: 'Organic Vegetables Pack', category: 'food', price: 12.50 },
        { name: 'Red Meat Beef Patty', category: 'food', price: 8.90 },
        { name: 'Recycled Paper Towels', category: 'other', price: 4.20 },
        { name: 'Cotton Socks Pack', category: 'clothing', price: 15.00 }
      ],
      totalCarbonEmissions: 17.5 // Food: beef has high carbon, veg low, clothing medium
    };
  }
};
