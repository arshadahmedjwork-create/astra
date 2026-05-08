export interface GalleryImage {
  url: string;
  alt: string;
}

export interface GalleryCategory {
  id: string;
  title: string;
  description: string;
  images: GalleryImage[];
}

export const galleryCategories: GalleryCategory[] = [
  {
    id: "cows-grazing",
    title: "Cows Grazing",
    description: "Our happy Kankrej cows freely grazing on organic fodder across our lush farm.",
    images: [
      { url: "/gallery/cowsgrazing_large_01.jpg", alt: "Cows grazing on green pasture" },
      { url: "/gallery/cowsgrazing_large_02.jpg", alt: "Kankrej cows in open fields" },
      { url: "/gallery/cowsgrazing_large_05.jpg", alt: "Cows near watering trough" },
      { url: "/gallery/cowsgrazing_large_08.jpg", alt: "Herd of cows grazing" },
      { url: "/gallery/cowsgrazing_large_10.jpg", alt: "Cow mother and calf" },
      { url: "/gallery/cowsgrazing_large_11.jpg", alt: "Kankrej cow in shelter" },
      { url: "/gallery/cowsgrazing_large_12.jpg", alt: "Cows in the farm enclosure" },
      { url: "/gallery/cowsgrazing_large_13.jpg", alt: "Cattle on open farmland" },
      { url: "/gallery/cowsgrazing_large_14.jpg", alt: "Grazing cows at dusk" },
      { url: "/gallery/cowsgrazing_large_15.jpg", alt: "Cows in natural habitat" },
      { url: "/gallery/cowsgrazing_large_16.jpg", alt: "Free-range cattle grazing" },
      { url: "/gallery/cowsgrazing_large_17.jpg", alt: "Cows on the farmland" },
      { url: "/gallery/cowsgrazing_large_18.jpg", alt: "Cattle near trees" },
      { url: "/gallery/cowsgrazing_large_19.jpg", alt: "Wide farm view with cows" },
      { url: "/gallery/cowsgrazing_large_20.jpg", alt: "Cows resting on farm" },
      { url: "/gallery/cowsgrazing_large_21.jpg", alt: "Kankrej cow portrait" },
      { url: "/gallery/cowsgrazing_large_22.jpg", alt: "Cows in the milking area" },
      { url: "/gallery/cowsgrazing_large_23.jpg", alt: "Cows grazing at midday" },
      { url: "/gallery/cowsgrazing_large_24.jpg", alt: "Farm landscape with cattle" },
      { url: "/gallery/cowsgrazing_large_25.jpg", alt: "Cattle in open fields" },
      { url: "/gallery/cowsgrazing_large_27.jpg", alt: "Grazing herd at Astra Farm" },
      { url: "/gallery/cowsgrazing_large_28.jpg", alt: "Cows near water source" },
      { url: "/gallery/cowsgrazing_large_29.jpg", alt: "Astra farm panoramic view" },
      { url: "/gallery/cowsgrazing_large_30.jpg", alt: "Cattle under farm shade" },
    ],
  },
  {
    id: "farm-cleaning",
    title: "Farm Cleaning",
    description: "Our farm maintenance operations ensuring a clean, healthy environment for all animals.",
    images: [
      { url: "/gallery/farmcleaning_large_01.jpg", alt: "Farm cleaning operations" },
      { url: "/gallery/farmcleaning_large_02.jpg", alt: "Tractor cleaning the farm" },
      { url: "/gallery/farmcleaning_large_03.jpg", alt: "Farm wash-down in progress" },
      { url: "/gallery/farmcleaning_large_04.jpg", alt: "Heavy machinery cleaning" },
      { url: "/gallery/farmcleaning_large_05.jpg", alt: "Farm maintenance work" },
      { url: "/gallery/farmcleaning_large_06.jpg", alt: "Cow shelter maintenance" },
      { url: "/gallery/farmcleaning_large_07.jpg", alt: "Farm floor cleaning" },
    ],
  },
  {
    id: "construction",
    title: "Construction of Farm in 2011",
    description: "The beginning of Astra Dairy — from bare land to a thriving, world-class organic farm.",
    images: [
      { url: "/gallery/constructionoffarm_large_01.jpg", alt: "Farm construction at sunrise" },
      { url: "/gallery/constructionoffarm_large_02.jpg", alt: "Foundation work in 2011" },
      { url: "/gallery/constructionoffarm_large_03.jpg", alt: "Structural framework going up" },
      { url: "/gallery/constructionoffarm_large_04.jpg", alt: "Farm site construction" },
      { url: "/gallery/constructionoffarm_large_05.jpg", alt: "Construction progress view" },
    ],
  },
  {
    id: "milking-parlour",
    title: "Milking Parlour Installation",
    description: "State-of-the-art milking equipment installed to ensure hygienic, stress-free milking.",
    images: [
      { url: "/gallery/milking_parlour_instalation_large_01.jpg", alt: "Milking equipment setup" },
      { url: "/gallery/milking_parlour_instalation_large_02.jpg", alt: "Milking machines installed" },
      { url: "/gallery/milking_parlour_instalation_large_03.jpg", alt: "Milk collection system" },
      { url: "/gallery/milking_parlour_instalation_large_04.jpg", alt: "Milking parlour exterior" },
    ],
  },
  {
    id: "natural-fodder",
    title: "Natural Fodder Cultivation",
    description: "Growing our own organic fodder — corn, alfalfa, and grains — free from GMOs.",
    images: [
      { url: "/gallery/natural_fodder_cultivation_large_01.jpg", alt: "Fodder seedling rows" },
      { url: "/gallery/natural_fodder_cultivation_large_02.jpg", alt: "Natural fodder cultivation" },
      { url: "/gallery/natural_fodder_cultivation_large_03.jpg", alt: "Young fodder plants growing" },
      { url: "/gallery/natural_fodder_cultivation_large_04.jpg", alt: "Irrigation of fodder fields" },
      { url: "/gallery/natural_fodder_cultivation_large_05.jpg", alt: "Organic farm aerial view" },
    ],
  },
  {
    id: "fully-grown-fodder",
    title: "Fully Grown Fodder",
    description: "Lush, fully matured organic fodder ready for harvest and feeding.",
    images: [
      { url: "/gallery/fully_grown_fodder_large_01.jpg", alt: "Fully grown green fodder" },
      { url: "/gallery/fully_grown_fodder_large_03.jpg", alt: "Tall corn fodder ready" },
      { url: "/gallery/fully_grown_fodder_large_04.jpg", alt: "Dense fodder crop field" },
      { url: "/gallery/fully_grown_fodder_large_05.jpg", alt: "Mature fodder plantation" },
      { url: "/gallery/fully_grown_fodder_large_06.jpg", alt: "Harvested fodder bundles" },
    ],
  },
  {
    id: "fodder-cutting",
    title: "Fodder Cutting",
    description: "Freshly cut fodder prepared daily for our cows, maintaining peak nutrition.",
    images: [
      { url: "/gallery/fodder_cutting_large_01.jpg", alt: "Fodder cutting machine" },
      { url: "/gallery/fodder_cutting_large_02.jpg", alt: "Workers cutting fodder" },
      { url: "/gallery/fodder_cutting_large_03.jpg", alt: "Chopped green fodder" },
      { url: "/gallery/fodder_cutting_large_04.jpg", alt: "Fodder preparation area" },
      { url: "/gallery/fodder_cutting_large_05.jpg", alt: "Daily fodder cutting" },
    ],
  },
  {
    id: "farm-visits",
    title: "Farm Visits",
    description: "School groups, families, and enthusiasts visiting Astra Dairy to experience nature farming.",
    images: [
      { url: "/gallery/farm_visits_large_01.jpg", alt: "School children visiting farm" },
      { url: "/gallery/farm_visits_large_02.jpg", alt: "Visitors exploring the farm" },
      { url: "/gallery/farm_visits_large_03.jpg", alt: "Kids at the farm visit" },
      { url: "/gallery/farm_visits_large_04.jpg", alt: "Families on farm tour" },
      { url: "/gallery/farm_visits_large_05.jpg", alt: "Farm visit group photo" },
      { url: "/gallery/farm_visits_large_06.jpg", alt: "Students learning about farming" },
      { url: "/gallery/farm_visits_large_07.jpg", alt: "Farm tour bus arrival" },
      { url: "/gallery/farm_visits_large_08.jpg", alt: "Visitors in the fodder fields" },
      { url: "/gallery/farm_visits_large_09.jpg", alt: "Nature education at Astra" },
      { url: "/gallery/farm_visits_large_10.jpg", alt: "Guests experiencing farm life" },
    ],
  },
  {
    id: "paddy",
    title: "Cultivating Natural Paddy",
    description: "Our self-sustaining farm's paddy cultivation using traditional, chemical-free methods.",
    images: [
      { url: "/gallery/cultivating_natural_paddy_large_01.jpg", alt: "Paddy field at Astra Farm" },
      { url: "/gallery/cultivating_natural_paddy_large_02.jpg", alt: "Rice cultivation in progress" },
      { url: "/gallery/cultivating_natural_paddy_large_03.jpg", alt: "Organic paddy fields" },
      { url: "/gallery/cultivating_natural_paddy_large_04.jpg", alt: "Natural paddy crop rows" },
      { url: "/gallery/cultivating_natural_paddy_large_05.jpg", alt: "Paddy harvest season" },
    ],
  },
  {
    id: "pongal",
    title: "Pongal Celebration",
    description: "Celebrating Pongal — the harvest festival — with our cows and farm community.",
    images: [
      { url: "/gallery/pongal_celebration_large_03.jpg", alt: "Pongal festival at Astra Dairy" },
      { url: "/gallery/pongal_celebration_large_05.jpg", alt: "Cows decorated for Pongal" },
    ],
  },
];

export const mediaCoverage = [
  {
    title: "The New Food Craft",
    date: "May 13, 2020",
    imageUrl: "/media/media_large_05.jpg"
  },
  {
    title: "Red News Wire",
    date: "January 31, 2017",
    imageUrl: "/media/media_large_04.jpg"
  },
  {
    title: "Agriculture Information",
    date: "June 21, 2016",
    imageUrl: "/media/media_large_03.jpg"
  },
  {
    title: "METROPLUS",
    date: "October 18, 2016",
    imageUrl: "/media/media_large_02.jpg"
  },
  {
    title: "The New Milky Way",
    date: "January 19, 2014",
    imageUrl: "/media/media_large_01.jpg"
  }
];

export const faqData = [
  {
    question: "Why Astra Dairy?",
    answer: "Astra Dairy delivers 100% natural, farm-fresh cow's milk directly to your home within 12 hours of milking. It is free from artificial hormones, pesticides, and preservatives."
  },
  {
    question: "Do you use growth hormones?",
    answer: "No. Our cows are never treated with artificial growth hormones like rBGH or bST."
  },
  {
    question: "Are antibiotics used on the cows?",
    answer: "We primarily rely on ayurvedic and homeopathic treatments. Antibiotics are only used for severe illness to prevent suffering, and the milk from a treated cow is discarded and never sold."
  },
  {
    question: "Why do you use glass bottles?",
    answer: "Glass bottles are environmentally friendly, help keep milk colder, and prevent chemical leaching often associated with plastic containers. This maintains the pure taste of our milk."
  },
  {
    question: "What breeds of cows do you have?",
    answer: "We originally started with Holstein and Jersey cows but shifted focus in 2013 to Kankrej cows, an indigenous Indian breed that adapts exceptionally well to the local climate."
  },
  {
    question: "Is your milk A1 or A2?",
    answer: "Our milk is a natural, untouched blend of A1 and A2 beta-casein proteins, reflecting nature quintessentially without genetic manipulation."
  },
  {
    question: "What do you feed your cows?",
    answer: "Our cows are fed a highly nutritious, organic diet of corn, grains, and alfalfa, grown in our own self-sustaining farm ecosystem. We never use GMOs or animal by-products."
  },
  {
    question: "Is Astra Dairy milk homogenized?",
    answer: "No, our milk is never homogenized. You will notice a natural layer of cream rising to the top of the bottle, which is the hallmark of pure, unprocessed milk."
  },
  {
    question: "Is the milk pasteurized or raw?",
    answer: "We supply milk in its raw, natural form (filtered and bottled). We strongly recommend that customers boil the milk before consumption."
  },
  {
    question: "What is the shelf life of your milk?",
    answer: "When stored properly at or below 4°C in the refrigerator, our fresh cow's milk will last up to 4 days."
  },
  {
    question: "Can I freeze the milk?",
    answer: "Yes, you can freeze our milk for up to 3 months. However, please transfer the milk out of the glass bottles before freezing to prevent the glass from breaking."
  }
];

export const companyInfo = {
  address: "Astra Dairy Farms Pvt Ltd, # 22, 1st Floor, 47th Street, Ashok Nagar, Chennai-600083, Tamil Nadu, India.",
  phone1: "+91 98400 37106",
  phone2: "+91 44 42318424",
  email: "support@astradairy.in",
  fssai: "12416002000177",
  deliveryTimes: "05:00 AM & 07:30 AM"
};
