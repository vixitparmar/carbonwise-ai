export interface CarbonInput {
  type: string;
  value: number;
  details?: Record<string, any>;
}

export function calculateCarbon(input: CarbonInput): number {
  const { type, value, details = {} } = input;

  if (value <= 0) return 0;

  switch (type) {
    case 'travel': {
      const mode = details.mode || 'gasoline_car';
      switch (mode) {
        case 'gasoline_car':
          return value * 0.20; // 200g/km
        case 'diesel_car':
          return value * 0.17; // 170g/km
        case 'hybrid_car':
          return value * 0.10; // 100g/km
        case 'electric_car':
          return value * 0.05; // 50g/km
        case 'motorcycle':
          return value * 0.11; // 110g/km
        default:
          return value * 0.20;
      }
    }
    case 'public_transport': {
      const mode = details.mode || 'bus';
      switch (mode) {
        case 'bus':
          return value * 0.08; // 80g/km
        case 'train':
        case 'metro':
          return value * 0.04; // 40g/km
        default:
          return value * 0.06;
      }
    }
    case 'flight': {
      // Short-haul flights are more carbon intensive per km than long-haul
      const distance = details.distance || 'short';
      if (distance === 'short') {
        return value * 0.25; // 250g/km for < 1500km
      } else {
        return value * 0.15; // 150g/km for long-haul
      }
    }
    case 'electricity': {
      // kWh to kg CO2 (Grid average)
      const source = details.source || 'grid';
      if (source === 'solar' || source === 'wind' || source === 'nuclear') {
        return value * 0.02; // Solar/Wind has a minor footprint for lifecycle
      }
      return value * 0.45; // 450g per kWh global grid average
    }
    case 'water': {
      // Liters of water (lifecycle treatment carbon)
      return value * 0.0003; // 0.3g per liter
    }
    case 'food': {
      // meals logged
      const diet = details.diet || 'omnivore';
      switch (diet) {
        case 'vegan':
          return value * 0.5; // 0.5 kg CO2 per meal
        case 'vegetarian':
          return value * 0.8; // 0.8 kg CO2 per meal
        case 'poultry':
          return value * 1.5; // 1.5 kg CO2 per meal
        case 'red_meat':
          return value * 3.2; // 3.2 kg CO2 per meal
        default:
          return value * 1.2; // default avg meal
      }
    }
    case 'shopping': {
      const category = details.category || 'general';
      switch (category) {
        case 'clothing':
          return value * 12.0; // 12kg per item average
        case 'electronics':
          return value * 90.0; // 90kg per item average
        case 'appliances':
          return value * 180.0; // 180kg per appliance
        case 'furniture':
          return value * 45.0;
        default:
          return value * 2.0; // 2kg per generic household item/kg
      }
    }
    case 'waste': {
      // Waste in kg
      const recycled = details.recycled === true || details.recycled === 'true';
      if (recycled) {
        return value * 0.08; // Recycled waste is only 80g/kg
      }
      return value * 1.25; // Landfill waste is 1.25kg/kg due to methane
    }
    case 'cycling':
    case 'walking':
      return 0; // Carbon-free transportation!
    default:
      return 0;
  }
}
