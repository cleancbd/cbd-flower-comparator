import React, { useState } from 'react';
import { 
  Leaf, 
  Droplets, 
  Wind, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Search,
  ShieldCheck,
  Zap,
  Eye,
  Beaker,
  Languages,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type FlowerType = 'natural' | 'infused' | 'sprayed';
type Language = 'en' | 'fr';
type SortField = 'name' | 'type' | 'recycled' | 'potency' | 'legality';
type SortDirection = 'asc' | 'desc';

interface CannabinoidData {
  name: string;
  type: string;
  effects: string;
  recycled: string;
  potency: number;
  legality: string;
  psychoactive: boolean;
}

interface ComparisonData {
  id: FlowerType;
  title: string;
  subtitle: string;
  description: string;
  pros: string[];
  cons: string[];
  effects: string;
  appearance: string;
  safetyLabel: string;
}

const TRANSLATIONS = {
  en: {
    nav: {
      comparison: 'Comparison 📊',
      cannabinoids: 'Molecules 🧪',
      safety: 'Safety Guide 🛡️',
      faq: 'FAQ ❓'
    },
    hero: {
      title: 'Know Your 🌿',
      titleAccent: 'Flower ✨',
      subtitle: 'Not all CBD buds are created equal. Understand the differences between natural, infused, and sprayed flowers to make an informed choice. 🧐'
    },
    labels: {
      safety: 'Safety 🛡️',
      effectProfile: 'Effect Profile ⚡',
      visualTexture: 'Visual & Texture 👁️',
      advantages: 'Key Advantages ✅',
      considerations: 'Considerations ⚠️',
      safetyHigh: 'high 🟢',
      safetyMedium: 'medium 🟡',
      safetyLow: 'low 🔴',
      psychoactive: 'Psychoactive 🧠',
      nonPsychoactive: 'Non-Psychoactive 🧘',
      cannabinoidType: 'Type 🏷️',
      cannabinoidEffects: 'Primary Effects ✨',
      cannabinoidRecycled: 'Recycled Base / Precursors 🔄',
      cannabinoidPotency: 'Psychoactivity Force (1-5) 🧠',
      cannabinoidLegality: 'Market Status ⚖️'
    },
    cannabinoidSection: {
      title: 'Cannabinoid Guide 🧪',
      subtitle: 'Beyond CBD: Comprehensive guide to natural and synthetic cannabinoids, recycled precursors, and potency. 🚀',
      data: [
        { name: 'CBD', type: 'Natural 🌿', effects: 'Deep relaxation, anxiety relief, body soothing without mental impairment. 🧘', recycled: 'Natural phytocannabinoid (raw hemp flowers) 🌱', potency: 1, legality: 'Legal / Regulated ✅', psychoactive: false },
        { name: 'CBG', type: 'Natural 🌿', effects: 'The "mother molecule": crisp mental focus, neuroprotective, antibacterial. 🎯', recycled: 'Natural phytocannabinoid (early-harvest hemp) 🌱', potency: 1, legality: 'Legal / Regulated ✅', psychoactive: false },
        { name: 'CBC', type: 'Natural 🌿', effects: 'Mood elevation, anti-inflammatory, amplifies natural entourage effects. 😊', recycled: 'Natural phytocannabinoid (raw hemp flowers) 🌱', potency: 1, legality: 'Legal ✅', psychoactive: false },
        { name: 'CBN', type: 'Natural (Aged) 🍂', effects: 'Strong physical sedation, renowned sleep aid, gentle body unwinding. 😴', recycled: 'Natural plant oxidation of aged THC fractions 🍂', potency: 2, legality: 'Legal ✅', psychoactive: false },
        { name: 'THCV', type: 'Natural 🌿', effects: 'The "diet weed": appetite suppression, alert mental energy, zero couch-lock. ⚡', recycled: 'Rare natural propyl phytocannabinoid (African landraces) 🌱', potency: 2.5, legality: 'Legal / Regulated ✅', psychoactive: true },
        { name: 'CBDX', type: 'Enhanced / Semi-Synthetic 🧪', effects: 'Optimized CBD formula: rapid cellular uptake, deep muscular release, zero fog. 🛡️', recycled: 'CBD isolate boosted with bio-enhanced terpenes & light analogues 🔄', potency: 1, legality: 'Legal / Regulated ✅', psychoactive: false },
        { name: 'H4CBD', type: 'Semi-Synthetic / Hydrogenated 🧪', effects: 'Hydrogenated CBD with noticeable CB1 affinity: deep physical tranquility, anxiety-free buzz. 🧘', recycled: 'Catalytic hydrogenation of pure CBD isolate (4 hydrogen atoms added) 🔄', potency: 2, legality: 'Restricted / Banned in EU ⚠️', psychoactive: true },
        { name: 'THCBD', type: 'Hybrid / Semi-Synthetic 🧪', effects: 'Balanced harmony: physical comfort accompanied by a mild, grounded head lift. ⚖️', recycled: 'Hybrid pairing of CBD isolate residues with isomerized Δ8-THC 🔄', potency: 3, legality: 'Grey Area ⚠️', psychoactive: true },
        { name: 'D8 (Delta-8)', type: 'Semi-Synthetic / Isomer 🧪', effects: 'Smooth relaxed euphoria, lower anxiety/paranoia risk than D9, body ease. 🍃', recycled: 'Acid-catalyzed cyclization & isomerization of pure CBD isolate 🔄', potency: 3.5, legality: 'Grey Area / Regulated ⚠️', psychoactive: true },
        { name: '10-OH-HHC', type: 'Semi-Synthetic 🧪', effects: 'Active oxygenated metabolite, light euphoric buzz, shorter duration than HHC. 🌀', recycled: 'Hydroxy metabolite synthesized from HHC / CBD precursors 🔄', potency: 3, legality: 'Grey Area / Restricted ⚠️', psychoactive: true },
        { name: 'D10', type: 'Semi-Synthetic 🧪', effects: 'Sativa-like cerebral spark, daytime alertness, clear-headed stimulation. ⚡', recycled: 'Acid-catalyzed conversion of CBD into Δ8-THC & Δ10-THC isomers 🔄', potency: 3, legality: 'Restricted / Grey Area ⚠️', psychoactive: true },
        { name: 'HHC', type: 'Semi-Synthetic / Hydrogenated 🧪', effects: 'Classic HHC: very similar to Delta-9 THC, cerebral euphoria, long-lasting physical chill. 🌀', recycled: 'Catalytic hydrogenation of THC or CBD-converted isomers (saturated carbon bonds) 🔄', potency: 4, legality: 'Banned / Controlled Substance 🚫', psychoactive: true },
        { name: 'HHCO', type: 'Synthetic / Acetate Ester ⚗️', effects: 'Delayed onset prodrug: amplified psychoactive intensity (~1.5-2x HHC), deep heavy stone. 🚀', recycled: 'Acetylation of HHC with acetic anhydride (boosts lipophilicity) 🔄', potency: 4.5, legality: 'Banned / Controlled Substance 🚫', psychoactive: true },
        { name: 'STV10', type: 'Semi-Synthetic Blend 🧪', effects: 'Dedicated sativa mimic: energetic burst, creative focus, motivation without crash. ⚡', recycled: 'Formulated from recycled Δ10-THC, Δ8-THC & stimulating terpenes 🔄', potency: 4, legality: 'Grey Area ⚠️', psychoactive: true },
        { name: 'DC10', type: 'Synthetic Blend ⚗️', effects: 'Deep somatic sedation, heavy body calm, potent modern post-ban formula. 🌊', recycled: 'Chlorinated / functionalized derivative built on Δ8 & Δ10 bases 🔄', potency: 4, legality: 'Grey Area ⚠️', psychoactive: true },
        { name: 'THX', type: 'Semi-Synthetic 🧪', effects: 'Marked cerebral elevation and heavy physical release, strong psychoactive punch. 🌀', recycled: 'Semi-synthetic blend elaborated on reactivated Δ8 & Δ9 isomer fractions 🔄', potency: 4, legality: 'Grey Area ⚠️', psychoactive: true },
        { name: 'CSA', type: 'Synthetic Blend ⚗️', effects: 'Narcotic physical ease, heavy muscle tranquility, potent legal THC alternative. 🌊', recycled: 'Synthetic substitution complex synthesized from CBD ➔ Δ8 pathways 🔄', potency: 4, legality: 'Grey Area ⚠️', psychoactive: true },
        { name: 'NL-1', type: 'Semi-Synthetic 🧪', effects: 'High-potency formulation designed to replicate intense legacy high-THC strains. 🔥', recycled: 'Semi-synthetic skeleton built on alkylated Δ8-THC core structures 🔄', potency: 4.5, legality: 'Grey Area ⚠️', psychoactive: true },
        { name: 'THC (Delta-9)', type: 'Natural 🌿', effects: 'The classic psychoactive reference: strong euphoria, sensory shifts, heavy body stone. 🔥', recycled: 'Primary natural cannabinoid of Cannabis Sativa/Indica trichomes 🌱', potency: 5, legality: 'Controlled / Illegal (>0.3%) 🚫', psychoactive: true },
        { name: 'T9HC', type: 'Semi-Synthetic / Isomer 🧪', effects: 'Synthetic Δ9 analogue: intense euphoria, perceptual alteration, strong couch-lock. 🔥', recycled: 'Recycled through acid-catalyzed isomerization of CBD into Δ9-THC & Δ8 🔄', potency: 5, legality: 'Regulated / Restricted (>0.3%) ⚠️', psychoactive: true },
        { name: 'THCP', type: 'Semi-Synthetic / Heptyl Analogue 🧪', effects: 'Ultra-high CB1 affinity (up to 33x standard THC): overwhelming high, lengthy duration. 🔥', recycled: 'Synthesized with 7-carbon heptyl resorcinol chain on terpenic CBD fractions 🔄', potency: 5, legality: 'Banned / Controlled Substance 🚫', psychoactive: true },
        { name: 'HHCP', type: 'Synthetic / Hydrogenated Heptyl ⚗️', effects: 'One of the most potent cannabinoids known: intense dissociation, extreme heavy high (>24h). 🚀', recycled: 'Hydrogenated variant of THCP heptyl chain under high-pressure catalytic processing 🔄', potency: 5, legality: 'Banned / Controlled Substance 🚫', psychoactive: true },
        { name: 'THCX', type: 'Synthetic Blend ⚗️', effects: 'Rapid explosive onset, heightened sensory rush, very strong psychoactive intensity. 🚀', recycled: 'Synthetic ester cocktail recycled from Δ8-THC, THC-B & synthetic esters 🔄', potency: 5, legality: 'Grey Area / Restricted ⚠️', psychoactive: true },
        { name: 'NL3', type: 'Synthetic Blend ⚗️', effects: 'Next-gen maximum potency: immediate cerebral rush, deep body numbness, prolonged duration. 🚀', recycled: '3rd generation complex recycled from Δ8, Δ9 distillates & acetate esters 🔄', potency: 5, legality: 'Grey Area ⚠️', psychoactive: true }
      ]
    },
    safetySection: {
      title: 'How to Spot "Sprayed" Flower 🕵️',
      subtitle: 'Protect yourself from low-quality or potentially harmful additives. 🛡️',
      tests: [
        {
          title: "The Touch Test 🖐️",
          desc: "Natural flower is sticky due to resin. Sprayed flower often feels greasy, oily, or leaves a residue on your fingers that smells like perfume. 🧴"
        },
        {
          title: "The Aroma Profile 👃",
          desc: "Natural cannabis has a complex 'dank' smell. Sprayed buds often smell intensely like one specific fruit or candy, masking a hay-like base. 🍬"
        },
        {
          title: "The Burn Test 🔥",
          desc: "Clean flower burns to a white or light grey ash. Sprayed flower may crackle, spark, or leave a dark, oily black ash. ⚡"
        }
      ]
    },
    banner: {
      title: 'Quality Matters 💎',
      desc: 'Always look for third-party lab reports (COAs). A reputable brand will provide detailed analysis of cannabinoid content, heavy metals, and pesticides. If a product seems too strong for its price, it might be sprayed. 🔬',
      button: 'Learn About Lab Testing 📖'
    },
    footer: {
      desc: 'Educational resource for understanding CBD flower quality and processing methods. Always consult with a healthcare professional before starting any new supplement. 📚'
    },
    flowerData: {
      natural: {
        title: 'Natural CBD Flower 🌿',
        subtitle: 'Pure, untreated hemp buds',
        description: 'Grown and harvested naturally. The cannabinoids and terpenes are produced by the plant itself during the flowering cycle. ☀️',
        pros: ['Cleanest experience ✨', 'Full entourage effect 🤝', 'No chemical residues 🚫', 'Natural aroma 👃'],
        cons: ['Lower CBD % (usually <15%) 📉', 'Varies by batch 🔄', 'Less intense flavor 👅'],
        effects: 'Gentle, balanced, and subtle. Focuses on relaxation without a "heavy" feeling. 🧘',
        appearance: 'Natural green hues, visible trichomes, slightly sticky but not greasy. 🍃',
        safetyLabel: 'high'
      },
      infused: {
        title: 'Infused Flower 💧',
        subtitle: 'Enhanced with CBD distillates',
        description: 'Natural flower that has been "dipped" or infused with high-purity CBD distillate or isolate to boost potency. 🚀',
        pros: ['High potency (20-40% CBD) 💪', 'Consistent effects 🎯', 'Enhanced terpene profiles 👃'],
        cons: ['Can feel "artificial" 🤖', 'Heavier smoke 💨', 'Distillate quality varies ⚖️'],
        effects: 'Stronger physical relaxation. More immediate onset than natural flower. 🌊',
        appearance: 'Often looks "frosted" or slightly darker/denser due to the added oils. ❄️',
        safetyLabel: 'medium'
      },
      sprayed: {
        title: 'Sprayed Flower 💨',
        subtitle: 'Treated with additives',
        description: 'Low-quality hemp sprayed with synthetic cannabinoids (like HHC, Delta-8) or artificial terpenes to mimic high-grade cannabis. ⚠️',
        pros: ['Very high "kick" ⚡', 'Extremely pungent aroma 👃', 'Cheap to produce 💸'],
        cons: ['Potential chemical solvents 🧪', 'Synthetic risks ☣️', 'Unpredictable effects 🌀', 'Harsh on lungs 🫁'],
        effects: 'Can be intense or "trippy" depending on the additive. Often leads to a "heady" or foggy feeling. 🌫️',
        appearance: 'May look unnaturally bright or feel greasy/oily to the touch. Smell is often "one-note". 🕯️',
        safetyLabel: 'low'
      }
    }
  },
  fr: {
    nav: {
      comparison: 'Comparaison 📊',
      cannabinoids: 'Molécules 🧪',
      safety: 'Guide de Sécurité 🛡️',
      faq: 'FAQ ❓'
    },
    hero: {
      title: 'Connaissez votre 🌿',
      titleAccent: 'Fleur ✨',
      subtitle: 'Toutes les fleurs de CBD ne se valent pas. Comprenez les différences entre les fleurs naturelles, infusées et vaporisées pour faire un choix éclairé. 🧐'
    },
    labels: {
      safety: 'Sécurité 🛡️',
      effectProfile: 'Profil d\'Effet ⚡',
      visualTexture: 'Visuel & Texture 👁️',
      advantages: 'Avantages Clés ✅',
      considerations: 'Considérations ⚠️',
      safetyHigh: 'élevée 🟢',
      safetyMedium: 'moyenne 🟡',
      safetyLow: 'faible 🔴',
      psychoactive: 'Psychoactif 🧠',
      nonPsychoactive: 'Non-Psychoactif 🧘',
      cannabinoidType: 'Type 🏷️',
      cannabinoidEffects: 'Effets Principaux ✨',
      cannabinoidRecycled: 'Cannabinoïdes Recyclés / Base 🔄',
      cannabinoidPotency: 'Force Psychoactive (1-5) 🧠',
      cannabinoidLegality: 'Statut Marché ⚖️'
    },
    cannabinoidSection: {
      title: 'Guide des Cannabinoïdes 🧪',
      subtitle: 'Au-delà du CBD : Guide exhaustif des molécules naturelles et synthétiques, précurseurs recyclés et puissance. 🚀',
      data: [
        { name: 'CBD', type: 'Naturel 🌿', effects: 'Relaxation profonde, apaisement de l\'anxiété, détente corporelle sans trouble cognitif. 🧘', recycled: 'Phytocannabinoïde naturel (fleur de chanvre brute) 🌱', potency: 1, legality: 'Légal / Régulé ✅', psychoactive: false },
        { name: 'CBG', type: 'Naturel 🌿', effects: 'La "mère des cannabinoïdes" : clarté mentale, concentration, anti-inflammatoire et antibactérien. 🎯', recycled: 'Phytocannabinoïde naturel (chanvre jeune) 🌱', potency: 1, legality: 'Légal / Régulé ✅', psychoactive: false },
        { name: 'CBC', type: 'Naturel 🌿', effects: 'Amélioration de l\'humeur, anti-inflammatoire, potentialisateur de l\'effet d\'entourage. 😊', recycled: 'Phytocannabinoïde naturel (fleur de chanvre brute) 🌱', potency: 1, legality: 'Légal ✅', psychoactive: false },
        { name: 'CBN', type: 'Naturel (Vieilli) 🍂', effects: 'Sédation marquée, aide majeure au sommeil, relaxation corporelle profonde. 😴', recycled: 'Oxydation naturelle du THC par maturation et affinage 🍂', potency: 2, legality: 'Légal ✅', psychoactive: false },
        { name: 'THCV', type: 'Naturel 🌿', effects: 'Surnommé "weed diététique" : régulation de l\'appétit, vivacité stimulante, focus diurne sans torpeur. ⚡', recycled: 'Phytocannabinoïde naturel rare à chaîne propyle à 3 carbones (variétés africaines) 🌱', potency: 2.5, legality: 'Légal / Régulé ✅', psychoactive: true },
        { name: 'CBDX', type: 'Enrichi / Semi-Synthétique 🧪', effects: 'Formule CBD amplifiée : absorption ultra-rapide, relâchement musculaire ciblé, clarté absolue. 🛡️', recycled: 'Isolat de CBD enrichi de terpènes bio-disponibles & analogues légers 🔄', potency: 1, legality: 'Légal / Régulé ✅', psychoactive: false },
        { name: 'H4CBD', type: 'Semi-Synthétique / Hydrogéné 🧪', effects: 'CBD hydrogéné avec affinité CB1 mesurable : apaisement corporel lourd, calme mental net, sans anxiété. 🧘', recycled: 'Hydrogénation catalytique d\'isolat de CBD pur (4 atomes d\'hydrogène fixés) 🔄', potency: 2, legality: 'Interdit en France (ANSM) ⚠️', psychoactive: true },
        { name: 'THCBD', type: 'Hybride / Semi-Synthétique 🧪', effects: 'Action équilibrée : bien-être corporel apaisant couplé à une légère élévation psychoactive. ⚖️', recycled: 'Recombinaison hybride associant résidus de CBD et Δ8-THC isomérisé 🔄', potency: 3, legality: 'Zone Grise ⚠️', psychoactive: true },
        { name: 'D8 (Delta-8)', type: 'Semi-Synthétique / Isomer 🧪', effects: 'Plus doux et serein que le D9 : euphorie apaisante, anxiété minime, détente musculaire douce. 🍃', recycled: 'Cyclisation et isomérisation acide catalytique d\'isolat de CBD pur 🔄', potency: 3.5, legality: 'Zone Grise / Réglementé ⚠️', psychoactive: true },
        { name: '10-OH-HHC', type: 'Semi-Synthétique 🧪', effects: 'Métabolite hydroxy actif, euphorie cérébrale modérée, durée plus courte que le HHC. 🌀', recycled: 'Métabolite oxygéné recyclé à partir de conversions HHC / CBD 🔄', potency: 3, legality: 'Zone Grise / Restreint ⚠️', psychoactive: true },
        { name: 'D10', type: 'Semi-Synthétique 🧪', effects: 'Euphorie stimulante douce, vivacité diurne, clarté mentale énergisante. ⚡', recycled: 'Conversion acide catalytique de CBD en isomères Δ8-THC & Δ10-THC 🔄', potency: 3, legality: 'Restreint / Zone Grise ⚠️', psychoactive: true },
        { name: 'HHC', type: 'Semi-Synthétique / Hydrogéné 🧪', effects: 'HHC classique : effets très proches du Delta-9 THC, euphorie claire, détente physique durable. 🌀', recycled: 'Hydrogénation catalytique du THC ou d\'isomères de CBD (saturation des doubles liaisons) 🔄', potency: 4, legality: 'Interdit (Classé stupéfiant ANSM) 🚫', psychoactive: true },
        { name: 'HHCO', type: 'Synthétique / Ester Acétate ⚗️', effects: 'Promédicament à effet retard : intensité psychoactive amplifiée (~1,5x à 2x le HHC), forte sédation. 🚀', recycled: 'Acétylation du HHC à l\'anhydride acétique (lipophilie accrue) 🔄', potency: 4.5, legality: 'Interdit (Classé stupéfiant ANSM) 🚫', psychoactive: true },
        { name: 'STV10', type: 'Mélange Semi-Synthétique 🧪', effects: 'Profil sativa stimulant ciblé : boost d\'énergie créative, motivation diurne sans léthargie. ⚡', recycled: 'Formulé à partir d\'isomères stimulants de Δ10-THC et Δ8-THC recyclés 🔄', potency: 4, legality: 'Zone Grise ⚠️', psychoactive: true },
        { name: 'DC10', type: 'Mélange Synthétique ⚗️', effects: 'Relaxation physique profonde, sensation corporelle marquée, formule post-interdiction puissante. 🌊', recycled: 'Dérivé fonctionnalisé/chloré à partir de bases recyclées Δ8-THC & Δ10-THC 🔄', potency: 4, legality: 'Zone Grise ⚠️', psychoactive: true },
        { name: 'THX', type: 'Semi-Synthétique 🧪', effects: 'Effet cérébral et corporel intense, sédation marquée, profil psychoactif très affirmé. 🌀', recycled: 'Formule semi-synthétique sur fractions réactivées d\'isomères Δ8 & Δ9 🔄', potency: 4, legality: 'Zone Grise ⚠️', psychoactive: true },
        { name: 'CSA', type: 'Mélange Synthétique ⚗️', effects: 'Relaxation intense quasi-narcotique, relâchement musculaire lourd, alternative au THC. 🌊', recycled: 'Complexe synthétique élaboré via filière de conversion CBD ➔ base Δ8 🔄', potency: 4, legality: 'Zone Grise ⚠️', psychoactive: true },
        { name: 'NL-1', type: 'Semi-Synthétique 🧪', effects: 'Haute puissance conçue pour émuler l\'impact cérébral des variétés classiques très fortes. 🔥', recycled: 'Structure semi-synthétique greffée sur squelette central de Δ8-THC alkylé 🔄', potency: 4.5, legality: 'Zone Grise ⚠️', psychoactive: true },
        { name: 'THC (Delta-9)', type: 'Naturel 🌿', effects: 'Le standard psychoactif naturel de référence : euphorie marquée, modification sensorielle, sédation physique. 🔥', recycled: 'Phytocannabinoïde naturel primaire majeur du Cannabis Sativa/Indica 🌱', potency: 5, legality: 'Réglementé / Stupéfiant (>0.3%) 🚫', psychoactive: true },
        { name: 'T9HC', type: 'Semi-Synthétique / Isomère 🧪', effects: 'Analogue synthétique du Δ9 : euphorie classique de référence, décollage psychoactif puissant. 🔥', recycled: 'Recyclé par isomérisation acide de CBD en isomères Δ9-THC & Δ8-THC 🔄', potency: 5, legality: 'Réglementé / Interdit (>0.3%) ⚠️', psychoactive: true },
        { name: 'THCP', type: 'Semi-Synthétique / Analogue Heptyle 🧪', effects: 'Puissance extrême : affinité récepteurs CB1 jusqu\'à 33x supérieure au THC standard ; effet écrasant et durable. 🔥', recycled: 'Synthétisé à partir de précurseurs à chaîne latérale heptyle (7 carbones) greffés sur CBD 🔄', potency: 5, legality: 'Interdit (Classé stupéfiant ANSM) 🚫', psychoactive: true },
        { name: 'HHCP', type: 'Synthétique / Hydrogéné Heptyle ⚗️', effects: 'L\'un des analogues les plus puissants : euphorie lourde, déconnexion sensorielle, durée pouvant excéder 24h. 🚀', recycled: 'Variante hydrogénée de THCP à chaîne heptyle sous hydrogénation haute pression 🔄', potency: 5, legality: 'Interdit (Classé stupéfiant ANSM) 🚫', psychoactive: true },
        { name: 'THCX', type: 'Mélange Synthétique ⚗️', effects: 'Montée euphorique fulgurante, saturation sensorielle décuplée, poussée psychoactive extrême. 🚀', recycled: 'Cocktail d\'esters synthétiques recyclés depuis Δ8-THC, THC-B & chaînes alkylées 🔄', potency: 5, legality: 'Zone Grise / Restreint ⚠️', psychoactive: true },
        { name: 'NL3', type: 'Mélange Synthétique ⚗️', effects: 'Formule 3e génération ultra-puissante : montée explosive, lourde euphorie et effet sédatif de longue durée. 🚀', recycled: 'Complexe synthétique 3e génération recyclé depuis distillats Δ8, Δ9 & esters 🔄', potency: 5, legality: 'Zone Grise ⚠️', psychoactive: true }
      ]
    },
    safetySection: {
      title: 'Comment repérer une fleur "vaporisée" 🕵️',
      subtitle: 'Protégez-vous des additifs de mauvaise qualité ou potentiellement nocifs. 🛡️',
      tests: [
        {
          title: "Le Test du Toucher 🖐️",
          desc: "La fleur naturelle est collante à cause de la résine. La fleur vaporisée semble souvent grasse, huileuse ou laisse un résidu sur vos doigts qui sent le parfum. 🧴"
        },
        {
          title: "Le Profil Aromatique 👃",
          desc: "Le cannabis naturel a une odeur complexe de 'dank'. Les têtes vaporisées sentent souvent intensément un fruit ou un bonbon spécifique, masquant une base de foin. 🍬"
        },
        {
          title: "Le Test de Combustion 🔥",
          desc: "Une fleur propre brûle en laissant une cendre blanche ou gris clair. Une fleur vaporisée peut crépiter, faire des étincelles ou laisser une cendre noire et huileuse. ⚡"
        }
      ]
    },
    banner: {
      title: 'La Qualité Compte 💎',
      desc: 'Recherchez toujours les rapports de laboratoire tiers (COA). Une marque réputée fournira une analyse détaillée du contenu en cannabinoïdes, métaux lourds et pesticides. Si un produit semble trop puissant pour son prix, il pourrait être vaporisé. 🔬',
      button: 'En savoir plus sur les tests 📖'
    },
    footer: {
      desc: 'Ressource éducative pour comprendre la qualité des fleurs de CBD et les méthodes de transformation. Consultez toujours un professionnel de santé avant de commencer tout nouveau supplément. 📚'
    },
    flowerData: {
      natural: {
        title: 'Fleur CBD Naturelle 🌿',
        subtitle: 'Bourgeons de chanvre purs et non traités',
        description: 'Cultivée et récoltée naturellement. Les cannabinoïdes et les terpènes sont produits par la plante elle-même pendant le cycle de floraison. ☀️',
        pros: ['Expérience la plus propre ✨', 'Effet d\'entourage complet 🤝', 'Aucun résidu chimique 🚫', 'Arôme naturel 👃'],
        cons: ['% de CBD plus bas (souvent <15%) 📉', 'Varie selon les lots 🔄', 'Saveur moins intense 👅'],
        effects: 'Doux, équilibré et subtil. Se concentre sur la relaxation sans sensation de "lourdeur". 🧘',
        appearance: 'Teintes vertes naturelles, trichomes visibles, légèrement collant mais pas gras. 🍃',
        safetyLabel: 'high'
      },
      infused: {
        title: 'Fleur Infusée 💧',
        subtitle: 'Enrichie avec des distillats de CBD',
        description: 'Fleur naturelle qui a été "trempée" ou infusée avec du distillat ou de l\'isolat de CBD de haute pureté pour augmenter la puissance. 🚀',
        pros: ['Haute puissance (20-40% CBD) 💪', 'Effets constants 🎯', 'Profils de terpènes améliorés 👃'],
        cons: ['Peut sembler "artificiel" 🤖', 'Fumée plus lourde 💨', 'La qualité du distillat varie ⚖️'],
        effects: 'Relaxation physique plus forte. Effet plus immédiat que la fleur naturelle. 🌊',
        appearance: 'Semble souvent "givrée" ou légèrement plus sombre/dense à cause des huiles ajoutées. ❄️',
        safetyLabel: 'medium'
      },
      sprayed: {
        title: 'Fleur Vaporisée 💨',
        subtitle: 'Traitée avec des additifs',
        description: 'Chanvre de basse qualité vaporisé avec des cannabinoïdes synthétiques (comme le HHC, Delta-8) ou des terpènes artificiels pour imiter le cannabis de haute qualité. ⚠️',
        pros: ['Très fort "kick" ⚡', 'Arôme extrêmement piquant 👃', 'Peu coûteux à produire 💸'],
        cons: ['Solvants chimiques potentiels 🧪', 'Risques synthétiques ☣️', 'Effets imprévisibles 🌀', 'Dur pour les poumons 🫁'],
        effects: 'Peut être intense ou "trippant" selon l\'additif. Entraîne souvent une sensation de brouillard mental. 🌫️',
        appearance: 'Peut paraître anormalement brillant ou gras/huileux au toucher. L\'odeur est souvent monotone. 🕯️',
        safetyLabel: 'low'
      }
    }
  }
};

const FLOWER_ICONS = {
  natural: <Leaf className="w-6 h-6" />,
  infused: <Droplets className="w-6 h-6" />,
  sprayed: <Wind className="w-6 h-6" />
};

export default function App() {
  const [selected, setSelected] = useState<FlowerType>('natural');
  const [lang, setLang] = useState<Language>('fr');
  const [moleculeFilter, setMoleculeFilter] = useState<'all' | 'natural' | 'semi' | 'synthetic'>('all');
  const [sortField, setSortField] = useState<SortField>('potency');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const t = TRANSLATIONS[lang];
  const currentFlower = t.flowerData[selected];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'potency' ? 'desc' : 'asc');
    }
  };

  const filteredAndSortedMolecules = [...t.cannabinoidSection.data]
    .filter((c) => {
      const typeLower = c.type.toLowerCase();
      if (moleculeFilter === 'natural' && !(typeLower.includes('naturel') || typeLower.includes('natural'))) return false;
      if (moleculeFilter === 'semi' && !(typeLower.includes('semi') || typeLower.includes('hybride') || typeLower.includes('hybrid') || typeLower.includes('isom') || typeLower.includes('enrich') || typeLower.includes('hydrogén') || typeLower.includes('hydrogen'))) return false;
      if (moleculeFilter === 'synthetic' && !(typeLower.includes('synth') && !typeLower.includes('semi'))) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          c.name.toLowerCase().includes(q) ||
          c.type.toLowerCase().includes(q) ||
          c.recycled.toLowerCase().includes(q) ||
          c.effects.toLowerCase().includes(q) ||
          c.legality.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'potency') {
        comparison = a.potency - b.potency;
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'type') {
        comparison = a.type.localeCompare(b.type);
      } else if (sortField === 'recycled') {
        comparison = a.recycled.localeCompare(b.recycled);
      } else if (sortField === 'legality') {
        comparison = a.legality.localeCompare(b.legality);
      }
      return sortDir === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-stone-800">CBD Comparator</h1>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-500">
              <a href="#compare" className="hover:text-emerald-600 transition-colors">{t.nav.comparison}</a>
              <a href="#molecules" className="hover:text-emerald-600 transition-colors">{t.nav.cannabinoids}</a>
              <a href="#safety" className="hover:text-emerald-600 transition-colors">{t.nav.safety}</a>
              <a href="./search.html" className="hover:text-emerald-600 transition-colors" target="_blank" rel="noopener noreferrer">Recherche Avancée 🔍</a>
              <a href="#faq" className="hover:text-emerald-600 transition-colors">{t.nav.faq}</a>
            </nav>

            <button 
              onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors text-sm font-bold"
            >
              <Languages className="w-4 h-4" />
              {lang.toUpperCase()}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-stone-900 mb-4 tracking-tight"
          >
            {t.hero.title} <span className="gradient-text">{t.hero.titleAccent}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-stone-600 max-w-2xl mx-auto"
          >
            {t.hero.subtitle}
          </motion.p>
        </section>

        {/* Selector Tabs */}
        <div id="compare" className="flex flex-wrap justify-center gap-3 mb-8">
          {(Object.keys(FLOWER_ICONS) as FlowerType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelected(type)}
              className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
                selected === type 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {FLOWER_ICONS[type]}
              {t.flowerData[type].title}
            </button>
          ))}
        </div>

        {/* Comparison Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selected}-${lang}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6 md:p-10 mb-20"
          >
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    currentFlower.safetyLabel === 'high' ? 'bg-emerald-100 text-emerald-700' :
                    currentFlower.safetyLabel === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {t.labels.safety}: {t.labels[`safety${currentFlower.safetyLabel.charAt(0).toUpperCase() + currentFlower.safetyLabel.slice(1)}` as keyof typeof t.labels]}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-stone-900 mb-2">{currentFlower.title}</h3>
                <p className="text-emerald-600 font-medium mb-6">{currentFlower.subtitle}</p>
                <p className="text-stone-600 leading-relaxed mb-8">
                  {currentFlower.description}
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="bg-emerald-50 p-3 rounded-xl h-fit">
                      <Zap className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 mb-1">{t.labels.effectProfile}</h4>
                      <p className="text-stone-600 text-sm">{currentFlower.effects}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-emerald-50 p-3 rounded-xl h-fit">
                      <Eye className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 mb-1">{t.labels.visualTexture}</h4>
                      <p className="text-stone-600 text-sm">{currentFlower.appearance}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                  <h4 className="flex items-center gap-2 font-bold text-stone-900 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    {t.labels.advantages}
                  </h4>
                  <ul className="space-y-3">
                    {currentFlower.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-stone-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                  <h4 className="flex items-center gap-2 font-bold text-stone-900 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    {t.labels.considerations}
                  </h4>
                  <ul className="space-y-3">
                    {currentFlower.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-stone-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Cannabinoid Comparison Section */}
        <section id="molecules" className="mb-20">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-stone-900 mb-4">{t.cannabinoidSection.title}</h3>
            <p className="text-stone-600 max-w-3xl mx-auto">{t.cannabinoidSection.subtitle}</p>
          </div>

          {/* Category Filter Chips & Quick Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {[
                { id: 'all', label: lang === 'fr' ? `Toutes (${t.cannabinoidSection.data.length}) 🧪` : `All (${t.cannabinoidSection.data.length}) 🧪` },
                { id: 'natural', label: lang === 'fr' ? 'Naturels 🌿' : 'Natural 🌿' },
                { id: 'semi', label: lang === 'fr' ? 'Semi-Synthétiques & Hybrides 🧪' : 'Semi-Synthetic & Hybrids 🧪' },
                { id: 'synthetic', label: lang === 'fr' ? 'Mélanges Synthétiques ⚗️' : 'Synthetic Blends ⚗️' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMoleculeFilter(tab.id as typeof moleculeFilter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    moleculeFilter === tab.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick search input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'fr' ? 'Filtrer (ex: THC, HHC, CBN)...' : 'Filter (e.g. THC, HHC, CBN)...'}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800 placeholder-stone-400 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
                  title={lang === 'fr' ? 'Effacer' : 'Clear'}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Sort Helper & Counter */}
          <div className="flex items-center justify-between text-xs text-stone-500 px-1 mb-2">
            <span className="font-medium text-stone-600">
              {lang === 'fr' 
                ? `${filteredAndSortedMolecules.length} molécule(s) affichée(s) • Cliquez sur un en-tête pour trier`
                : `${filteredAndSortedMolecules.length} molecule(s) displayed • Click column headers to sort`}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold text-[11px]">
              {lang === 'fr' ? 'Tri :' : 'Sort:'}{' '}
              {sortField === 'potency' ? (lang === 'fr' ? 'Force (1-5)' : 'Potency (1-5)') :
               sortField === 'name' ? (lang === 'fr' ? 'Nom' : 'Name') :
               sortField === 'type' ? 'Type' :
               sortField === 'recycled' ? (lang === 'fr' ? 'Précurseur' : 'Precursor') :
               (lang === 'fr' ? 'Légalité' : 'Legality')}
              <span className="text-emerald-600 font-bold">{sortDir === 'asc' ? '▲ Croissant' : '▼ Décroissant'}</span>
            </span>
          </div>

          <div className="overflow-x-auto shadow-sm border border-stone-200 rounded-2xl bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-700 text-xs uppercase tracking-wider font-bold border-b border-stone-200">
                  {/* Molecule Name */}
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-5 py-4 cursor-pointer select-none hover:bg-stone-100 transition-colors group"
                    title={lang === 'fr' ? 'Cliquer pour trier par nom de molécule' : 'Click to sort by molecule name'}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{lang === 'fr' ? 'Molécule 🔬' : 'Molecule 🔬'}</span>
                      {sortField === 'name' ? (
                        sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
                      )}
                    </div>
                  </th>

                  {/* Type */}
                  <th 
                    onClick={() => handleSort('type')}
                    className="px-5 py-4 cursor-pointer select-none hover:bg-stone-100 transition-colors group"
                    title={lang === 'fr' ? 'Cliquer pour trier par type' : 'Click to sort by type'}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t.labels.cannabinoidType}</span>
                      {sortField === 'type' ? (
                        sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
                      )}
                    </div>
                  </th>

                  {/* Recycled Precursors */}
                  <th 
                    onClick={() => handleSort('recycled')}
                    className="px-5 py-4 cursor-pointer select-none hover:bg-stone-100 transition-colors group"
                    title={lang === 'fr' ? 'Cliquer pour trier par précurseur / base recyclée' : 'Click to sort by recycled precursor'}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t.labels.cannabinoidRecycled}</span>
                      {sortField === 'recycled' ? (
                        sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
                      )}
                    </div>
                  </th>

                  {/* Psychoactivity Force 1-5 */}
                  <th 
                    onClick={() => handleSort('potency')}
                    className={`px-5 py-4 cursor-pointer select-none hover:bg-stone-100 transition-colors group ${
                      sortField === 'potency' ? 'bg-emerald-50/50' : ''
                    }`}
                    title={lang === 'fr' ? 'Cliquer pour trier par force psychoactive (1-5)' : 'Click to sort by psychoactivity force (1-5)'}
                  >
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <span>{t.labels.cannabinoidPotency}</span>
                      {sortField === 'potency' ? (
                        sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
                      )}
                    </div>
                  </th>

                  {/* Effects */}
                  <th className="px-5 py-4">{t.labels.cannabinoidEffects}</th>

                  {/* Market Status / Legality */}
                  <th 
                    onClick={() => handleSort('legality')}
                    className="px-5 py-4 cursor-pointer select-none hover:bg-stone-100 transition-colors group"
                    title={lang === 'fr' ? 'Cliquer pour trier par statut légal' : 'Click to sort by legality'}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{t.labels.cannabinoidLegality}</span>
                      {sortField === 'legality' ? (
                        sortDir === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAndSortedMolecules.map((c, i) => (
                  <tr key={i} className="hover:bg-stone-50/80 transition-colors">
                    {/* Name */}
                    <td className="px-5 py-4 align-top">
                      <div className="font-bold text-base text-stone-900 flex items-center gap-2">
                        <span className="text-emerald-700">{c.name}</span>
                      </div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.psychoactive ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {c.psychoactive ? t.labels.psychoactive : t.labels.nonPsychoactive}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="px-5 py-4 align-top">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 inline-block">
                        {c.type}
                      </span>
                    </td>

                    {/* Recycled Cannabinoid Precursor */}
                    <td className="px-5 py-4 align-top min-w-[210px] max-w-xs">
                      <div className={`text-xs p-2 rounded-lg border leading-relaxed ${
                        c.type.toLowerCase().includes('naturel') || c.type.toLowerCase().includes('natural')
                          ? 'bg-emerald-50/60 text-emerald-900 border-emerald-200/70'
                          : 'bg-purple-50/70 text-purple-900 border-purple-200/80'
                      }`}>
                        {c.recycled}
                      </div>
                    </td>

                    {/* Psychoactivity Force 1 to 5 */}
                    <td className="px-5 py-4 align-top min-w-[150px]">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            c.potency >= 5 ? 'bg-red-100 text-red-700 border border-red-200' :
                            c.potency >= 4 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                            c.potency >= 3 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            c.potency >= 2 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}>
                            {c.potency}/5
                          </span>
                          <span className="text-[11px] font-semibold text-stone-600">
                            {c.potency >= 5 ? (lang === 'fr' ? 'Maximal 🔥' : 'Maximal 🔥') :
                             c.potency >= 4 ? (lang === 'fr' ? 'Fort ⚡' : 'Strong ⚡') :
                             c.potency >= 3 ? (lang === 'fr' ? 'Moyen 🌀' : 'Moderate 🌀') :
                             c.potency >= 2 ? (lang === 'fr' ? 'Léger 🍃' : 'Mild 🍃') :
                             (lang === 'fr' ? 'Nul 🧘' : 'None 🧘')}
                          </span>
                        </div>
                        {/* 5-segment level gauge */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`h-1.5 w-4 rounded-full transition-all ${
                                lvl <= Math.floor(c.potency)
                                  ? c.potency >= 5
                                    ? 'bg-red-500'
                                    : c.potency >= 4
                                    ? 'bg-orange-500'
                                    : c.potency >= 3
                                    ? 'bg-amber-500'
                                    : c.potency >= 2
                                    ? 'bg-yellow-500'
                                    : 'bg-emerald-500'
                                  : lvl - 0.5 === c.potency
                                  ? 'bg-orange-400'
                                  : 'bg-stone-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </td>

                    {/* Effects */}
                    <td className="px-5 py-4 align-top text-xs text-stone-600 leading-relaxed min-w-[200px] max-w-sm">
                      {c.effects}
                    </td>

                    {/* Legality / Market Status */}
                    <td className="px-5 py-4 align-top text-xs text-stone-500 italic whitespace-nowrap">
                      {c.legality}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Safety Guide Section */}
        <section id="safety" className="mb-20">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-stone-900 mb-4">{t.safetySection.title}</h3>
            <p className="text-stone-600">{t.safetySection.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {t.safetySection.tests.map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  {i === 0 ? <ShieldCheck className="w-6 h-6 text-emerald-600" /> : 
                   i === 1 ? <Beaker className="w-6 h-6 text-emerald-600" /> : 
                   <Wind className="w-6 h-6 text-emerald-600" />}
                </div>
                <h4 className="font-bold text-stone-900 mb-2">{item.title}</h4>
                <p className="text-stone-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Info Banner */}
        <div className="bg-emerald-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{t.banner.title}</h3>
            <p className="text-emerald-100 mb-8 leading-relaxed">
              {t.banner.desc}
            </p>
            <button className="bg-white text-emerald-900 px-8 py-3 rounded-full font-bold hover:bg-emerald-50 transition-colors">
              {t.banner.button}
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-700 rounded-full -mr-16 -mb-16 blur-2xl opacity-30" />
        </div>
      </main>

      <footer className="bg-white border-t border-stone-200 py-12 mt-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-stone-800">CBD Comparator</span>
          </div>
          <p className="text-stone-500 text-sm max-w-md mx-auto mb-8">
            {t.footer.desc}
          </p>
          <div className="flex justify-center gap-6 text-stone-400">
            <a href="#" className="hover:text-emerald-600 transition-colors"><Info className="w-5 h-5" /></a>
            <a href="#" className="hover:text-emerald-600 transition-colors"><Search className="w-5 h-5" /></a>
            <a href="#" className="hover:text-emerald-600 transition-colors"><ShieldCheck className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
