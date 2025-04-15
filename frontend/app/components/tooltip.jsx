import "../styles/Tooltip.css";

const highRiskDescriptions = {
  "Acrylates Copolymer": "Plastic-based film-former. Can degrade into microplastics.",
  "Acrylates Crosspolymer": "Used for thickening. Persistent in the environment.",
  "Butylene": "Can be a synthetic polymer base. Low degradability.",
  "Carbomer": "Stabilizer that can trap microplastics in formulations.",
  "Dimethicone": "Silicone-based. Resistant to biodegradation.",
  "Ethylene": "Building block of polyethylene, a common microplastic.",
  "Methacrylate Copolymer": "Synthetic polymer. Not easily biodegradable.",
  "Methacrylate Crosspolymer": "Used for texture. Derived from fossil fuels.",
  "Methyl Methacrylate Copolymer": "Film-former linked to long-term pollution.",
  "Methyl Methacrylate Crosspolymer": "Creates smooth feel but hard to break down.",
  "Nylon": "Synthetic polymer often found as microfibers in water.",
  "Polyacrylamide": "Forms plastic films. Potential microplastic precursor.",
  "Polyacrylate": "Plastic-based. Used in gel-like consistencies.",
  "Polypropylene": "Widely used plastic that contributes to ocean waste.",
  "Polyurethane": "Highly durable and non-biodegradable.",
  "Polyvinyl": "Plastic polymer with persistent breakdown products.",
  "Propylene Copolymer": "Synthetic. Resists decomposition in nature.",
  "PVP": "Film-forming plastic. Found in many rinse-off products.",
  "Styrene Copolymer": "Linked to polystyrene microbeads.",
  "Tetrafluoroethylene": "Used in Teflon-like coatings. Highly persistent.",
  "Vinyl Acetate Copolymer": "Plasticizer. Can contribute to long-term microplastic load.",
  "VP/VA Copolymer": "Vinyl-based film former. Microplastic potential.",
};

const mediumRiskDescriptions = {
  "Acrylamidopropyltrimonium Chloride/​Acrylamide Copolymer": "Used for conditioning. Moderately persistent in the environment.",
  "Acrylates/​Palmeth-25 Acrylate Copolymer": "Derived from palm oil and plastics. May not fully degrade.",
  "Acrylates/​T-Butylacrylamide Copolymer": "Synthetic polymer. Possible microplastic residue.",
  "Acrylic Acid/​VP Crosspolymer": "Film-former that can resist breakdown.",
  "Methyl Methacrylate Crosspolymer": "Contributes to smooth texture. Microplastic concern.",
  "Adipic Acid/​Neopentyl Glycol Crosspolymer": "Synthetic thickener with unclear degradation profile.",
  "Adipic Acid/​Neopentyl Glycol/​Trimellitic Anhydride Copolymer": "Highly durable copolymer. May accumulate in ecosystems.",
  "Almond Oil PEG-6 Esters": "Natural origin, but PEG derivatives can persist.",
  "Aminopropyl Dimethicone": "Silicone-based. Some concerns about long-term accumulation.",
  "Ammonium Acryloyldimethyltaurate/​VP Copolymer": "Synthetic emulsifier. Moderately persistent.",
  "Ammonium Polyacryloyldimethyl Taurate": "Plastic-like consistency enhancer. Not easily broken down.",
  "Amodimethicone": "Silicone derivative. Accumulates in aquatic environments.",
  "Amodimethicone/​Morpholinomethyl Silsesquioxane Copolymer": "Specialty silicone. Medium biodegradability risk.",
  "Amodimethicone/​Silsesquioxane Copolymer": "Stable, film-forming silicone. May resist breakdown.",
  "Apricot Kernel Oil PEG-6 Esters": "Natural base, but PEG form can linger in water.",
  "Bis-Aminopropyl Dimethicone": "Conditioning silicone. Slow to degrade.",
  "Bis-Butyldimethicone Polyglyceryl-3": "Blended polymer. Possible microplastic derivative.",
  "Bis-C16-20 Isoalkoxy Tmhdi/​PEG-90 Copolymer": "Long-chain PEG compound. Possible persistence.",
  "Bis-Cetearyl Amodimethicone": "Conditioning agent. Accumulates in wash-off products.",
  "Bis-Diglyceryl Polyacyladipate-1": "Emollient. PEG-influenced persistence risk.",
  "Bis-Diglyceryl Polyacyladipate-2": "Similar to #1. More water-resistant.",
  "Bis-Diisopropanolamino-Pg-Propyl Dimethicone/​Bis-Isobutyl PEG-14 Copolymer": "Highly engineered. Medium biodegradability concern.",
};

const IngredientTooltip = ({ name }) => {
  const isHigh = highRiskDescriptions[name];
  const isMedium = mediumRiskDescriptions[name];

  if (isHigh || isMedium) {
    return (
      <span className={`tooltip ${isHigh ? "high-risk" : "medium-risk"}`}>
        {name}
        <span className="tooltip-text">
          {isHigh ? highRiskDescriptions[name] : mediumRiskDescriptions[name]}
        </span>
      </span>
    );
  }

  return <span>{name}</span>;
};

export default IngredientTooltip;
