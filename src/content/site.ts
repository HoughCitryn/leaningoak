import type { PackageContent, PageSeo, SiteConfig, VenuePageContent } from "./types";

export const siteConfig: SiteConfig = {
  name: "Leaning Oak Ranch",
  legalName: "Leaning Oak Ranch",
  url: "https://www.leaningoakranch.com",
  email: "barbara@leaningoakranch.com",
  phoneDisplay: "661-345-5102",
  phoneHref: "+16613455102",
  address: {
    streetAddress: "546 Renfro Rd",
    addressLocality: "Bakersfield",
    addressRegion: "CA",
    postalCode: "93314",
    addressCountry: "US",
  },
  facebook: "https://www.facebook.com/leaningoakranchvenue/",
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
};

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/the-venue/", label: "The Venue" },
  { href: "/information/", label: "Packages" },
  { href: "/photo-gallery/", label: "Photo Gallery" },
  { href: "/contact-us/", label: "Contact Us" },
] as const;

export const seo: Record<string, PageSeo> = {
  home: {
    path: "/",
    title: "Leaning Oak Ranch | Wedding Venue in Bakersfield, CA",
    description:
      "Leaning Oak Ranch is an outdoor wedding and event venue in Bakersfield, CA with year-round views, a grand gazebo, outdoor bar, bridal suite, and space for up to 150 guests.",
  },
  venue: {
    path: "/the-venue/",
    title: "Outdoor Wedding Venue in Bakersfield, CA | Leaning Oak Ranch",
    description:
      "Explore Leaning Oak Ranch, a private outdoor wedding and event venue in Bakersfield with landscaped grounds, a grand gazebo, outdoor bar, and space for up to 150 guests.",
  },
  information: {
    path: "/information/",
    title: "Wedding Packages & Pricing in Bakersfield | Leaning Oak Ranch",
    description:
      "View wedding packages, pricing, included decor, add-ons, and frequently asked questions for Leaning Oak Ranch in Bakersfield, CA.",
  },
  gallery: {
    path: "/photo-gallery/",
    title: "Leaning Oak Ranch Photo Gallery | Bakersfield Wedding Venue",
    description:
      "Explore wedding, reception, garden, gazebo, and venue photography from Leaning Oak Ranch in Bakersfield, CA.",
  },
  contact: {
    path: "/contact-us/",
    title: "Contact Leaning Oak Ranch | Bakersfield Wedding Venue",
    description:
      "Contact Leaning Oak Ranch to schedule a venue tour or ask about wedding dates, packages, pricing, and events in Bakersfield, CA.",
  },
  privacy: {
    path: "/privacy-practices/",
    title: "Privacy Practices | Leaning Oak Ranch",
    description:
      "Read Leaning Oak Ranch’s website privacy practices and California privacy notice.",
  },
};

export const homeContent = {
  title: "Bakersfield Wedding & Event Venue",
  subtitle: "Bakersfield’s Premier Event Venue",
  intro: [
    "Leaning Oak Ranch is the newest and finest wedding and event venue in Bakersfield, CA. Boasting the most stunning year-round views, you can’t find a backdrop like this anywhere else in Bakersfield.",
    "An outdoor wedding venue located on Renfro Road in the heart of Bakersfield, CA. We offer a large, mature landscaped setting with a full outdoor bar and grand gazebo that provides you with the intimacy and beauty that you are looking for. Our additional private bridal suite makes it the perfect location for your wedding or special event at the newest venue in Bakersfield.",
    "Leaning Oak Ranch was created with you in mind, so we make sure your needs are met from start to finish. Each season blooms new colors of life where new memories can be made. Your entire party will leave with a lasting impression!",
  ],
  services: [
    {
      title: "Weddings",
      body: "A private outdoor setting for your ceremony, reception, or both.",
    },
    {
      title: "Venue Capacity",
      body: "Fully customizable seating arrangements made easy for parties up to 150 guests.",
    },
    {
      title: "Outdoor Bar",
      body: "A full-size outdoor bar lets your party enjoy their drinks all day and night.",
    },
  ],
};

export const venueContent: VenuePageContent = {
  eyebrow: "Leaning Oak Ranch",
  title: "Four Seasons You Won’t Find Anywhere Else",
  intro: [
    "Leaning Oak Ranch is a “One of a Kind” Bakersfield Event Venue.",
    "Boasting a full four-season outdoor venue with gorgeous landscape and a magnificent leaning oak tree, Leaning Oak Ranch is the newest and finest event venue in Bakersfield, CA.",
    "Accommodating up to 150 guests, we welcome all parties looking to host an outdoor event on our 3 acres of gorgeous landscape. Not to mention the lavishly large gazebo and our full-size outdoor bar area. Among these unique features is a large area open for hundreds of chairs and tables, all lit by romantically beautiful lighting at the newest event venue in Bakersfield, CA.",
    "Leaning Oak Ranch’s goal is to please you and your guests from start to finish. We provide a romantic, relaxing, and intimate setting for the bride and her family and friends.",
  ],
  weddings: [
    "The intimate and elegant feeling that Leaning Oak Ranch provides the bride is second to none. Your family and friends can enjoy a heartfelt, relaxing day at our secluded outdoor wedding venue. Your special day begins with a mimosa bar for you and your bridesmaids in our beautifully furnished Bridal Suite. To make your day even more special, we ensure that the beautiful scenery presented at our venue can’t be found anywhere else in Bakersfield.",
    "Hosting your wedding at our Bakersfield wedding venue is the perfect choice. Your guests will be entertained the entire day and the bride will be comfortable in our private bridal suite.",
  ],
  events: [
    "Let the good times roll at Leaning Oak Ranch!",
    "We currently host wedding ceremonies and receptions. Feel free to contact us regarding your next event, and we will be more than happy to assist you at our Bakersfield event venue.",
    "Our location allows your guests to feel away from the city while still being close to home. Daytime or nighttime, the good vibes will be rolling around your event with music, food, games, and fun. Our outdoor bar and large gazebo allow you to have an open, private party with multiple large areas for guests to gather.",
  ],
};

export const packageContent: PackageContent = {
  name: "Deluxe Wedding Package",
  included: [
    "Multiple Ceremony Sites",
    "Romantic Reception Lighting",
    "Tables and Chairs with Setup and Breakdown",
    "Weekday Rehearsal",
    "Onsite Venue Coordinator",
    "Bridal Suite with Mimosa Bar",
    "End of Event Clean Up",
    "On-Site Parking",
  ],
  prices: [
    { range: "0-99 Guests", price: "$6,500" },
    { range: "100-150 Guests", price: "$8,000" },
  ],
  decor: [
    "11 Wine Barrels",
    "Wine Barrel Topper",
    "Umbrellas",
    "Patio Heaters (propane extra)",
    "Picture Table with Clips",
    "Giant Connect 4 Game",
    "Corn Hole Games",
    "Lanterns and Vases",
    "Gold Votive Cups",
    "Shepherd’s Hooks",
  ],
  addOns: [
    "Catered Buffet Dinner",
    "DJ Entertainment",
    "Bartender",
    "Officiant",
    "Table Linens and Dishware",
    "Wedding Cake",
    "Parking",
    "Decorative Chargers",
    "Security",
  ],
  notices: [
    "All pricing is guaranteed for 14 days from the date of tour.",
    "Prices are subject to change thereafter.",
  ],
  faq: [
    {
      question: "Do we require a deposit and when is the balance due?",
      answer:
        "Yes, a non-refundable $1,000 deposit is required at the time of booking. Fifty percent (50%) of the remaining balance is due 120 days before the event and the remaining balance is due in full 30 days before the event.",
    },
    {
      question: "What time do ceremonies usually start?",
      answer: "All services are based on a ceremony/reception time from 4 p.m. to 10 p.m. (6 hours). An earlier ceremony start time is available for an additional fee.",
    },
    {
      question: "May we bring our own alcoholic beverages?",
      answer: "Yes, you may bring in your own alcoholic beverages. All alcohol must be served by our in-house licensed and insured bartender.",
    },
    {
      question: "May we use our own caterer?",
      answer: "Yes, you may choose your own licensed and insured caterer.",
    },
    {
      question: "Questions to ask your caterer?",
      answer: "Are they self-contained? Do they provide dishware and flatware? Do they provide their own linens? Do they provide setup, takedown, and/or cleanup? Do they cut and serve the wedding cake?",
    },
    {
      question: "Do you need to hire a DJ for the music/reception?",
      answer: "Yes, an experienced DJ is a very important part of your event. A DJ can serve as the Master of Ceremonies, assist in directing the flow of the ceremony/reception, and help keep to your timeline. For all outdoor venues, the County of Kern mandates that the music must be turned off by 10:00 p.m.",
    },
    {
      question: "What does the On-Site Coordinator handle?",
      answer: "The On-Site Coordinator will coordinate your rehearsal, be onsite throughout your wedding day to organize vendors, organize your table and chair setup, and answer any questions. Please keep in mind that the On-Site Coordinator does not handle setup of linens, dishware, decorations, or cake cutting unless provided by Leaning Oak Ranch.",
    },
    {
      question: "Are children allowed?",
      answer: "Leaning Oak Ranch is primarily an adults-only venue. Children 12 and younger are welcome if they are part of the bridal/wedding party. We kindly ask that children 12 and younger not be invited as guests.",
    },
    {
      question: "Do we require an insurance policy?",
      answer: "Yes, a one-day General Certificate of Liability is required. A day-of-event insurance policy is available through EventInsuranceNow.com for approximately $180 with an alcohol rider add-on and takes about 10 minutes to complete.",
    },
    {
      question: "Do we require a damage/security deposit in addition to the booking deposit?",
      answer: "Yes. While the insurance policy does cover any major damages, the policy deductible is $500. A refundable check or cash payment of $500 is to be held on file and is required 7 days before the date of the event for any minor damages not covered by the insurance policy.",
    },
    {
      question: "Do we provide linens?",
      answer: "Yes, we offer linen selections as part of our Create Your Own Package add-on options.",
    },
    {
      question: "Is an appointment required to tour the venue?",
      answer: "Yes, to schedule an appointment to tour the venue, please call or text Barbara at 661-345-5102.",
    },
  ],
};
