from bs4 import BeautifulSoup
import requests
import sys
import json

def retrieve_risk_rating_for_search(lName):
    risk_factor = {
        "high" : ["Acrylates Copolymer", "Acrylates Crosspolymer", "Butylene", "Carbomer", "Dimethicone", "Ethylene",
        "Methacrylate Copolymer", "Methacrylate Crosspolymer", "Methyl Methacrylate Copolymer", "Methyl Methacrylate Crosspolymer",
        "Nylon", "Polyacrylamide", "Polyacrylate", "Polypropylene", "Polyurethane", "Polyvinyl", "Propylene Copolymer",
        "PVP", "Styrene Copolymer", "Tetrafluoroethylene", "Vinyl Acetate Copolymer", "VP/VA Copolymer"],

        "medium" : ["Acrylamidopropyltrimonium Chloride/​Acrylamide Copolymer", "Acrylates/​Palmeth-25 Acrylate Copolymer", 
        "Acrylates/​T-Butylacrylamide Copolymer", "Acrylic Acid/​VP Crosspolymer", "Methyl Methacrylate Crosspolymer", 
        "Adipic Acid/​Neopentyl Glycol Crosspolymer", "Adipic Acid/​Neopentyl Glycol/​Trimellitic Anhydride Copolymer", 
        "Almond Oil PEG-6 Esters", "Aminopropyl Dimethicone", "Ammonium Acryloyldimethyltaurate/​VP Copolymer", 
        "Ammonium Polyacryloyldimethyl Taurate", "Amodimethicone", "Amodimethicone/​Morpholinomethyl Silsesquioxane Copolymer", 
        "Amodimethicone/​Silsesquioxane Copolymer", "Apricot Kernel Oil PEG-6 Esters", "Bis-Aminopropyl Dimethicone", "Bis-Butyldimethicone Polyglyceryl-3", 
        "Bis-C16-20 Isoalkoxy Tmhdi/​PEG-90 Copolymer", "Bis-Cetearyl Amodimethicone", "Bis-Diglyceryl Polyacyladipate-1", "Bis-Diglyceryl Polyacyladipate-2",
        "Bis-Diisopropanolamino-Pg-Propyl Dimethicone/​Bis-Isobutyl PEG-14 Copolymer"]
    }

    items = []

    lurl = "https://incidecoder.com/search?query="
    
    lName = lName.split()

    for x in range(len(lName) -1):
        lurl+=lName[x].lower()
        lurl+="+"

    lurl += str(lName[-1])

    html_text = requests.get(lurl).text
    soup = BeautifulSoup(html_text, 'lxml')
    products = soup.find_all('a', class_ = "klavika simpletextlistitem")

    for product in products:
        if product.text not in items:
            items.append(product.text)

    #print("Search results are as follows: ")


    def risk_display(prName):
        dic = {"name": prName, "risk":"", "high":[], "med":[], "image":""}
        purl = "https://incidecoder.com/products/"
        prName = prName.lower()
        prName = prName.replace(",", "")
        prName = prName.replace("'", "")
        prName = prName.split()
        for x in range(len(prName) -1):
            purl+=prName[x]
            purl+="-"

        purl += str(prName[-1])
        #print(purl)


        html_text = requests.get(purl).text
        soup = BeautifulSoup(html_text, 'lxml')
        ingredients = soup.find_all('a', class_ = "ingred-link black")


        for ingredient in ingredients:
            if ingredient.text in risk_factor["high"] and ingredient.text not in dic["high"]:
                dic["high"].append(ingredient.text)
            elif ingredient.text in risk_factor["medium"] and ingredient.text not in dic["med"]:
                dic["med"].append(ingredient.text)

        if len(dic["high"]) > 0:
            dic["risk"] = "high"
            '''
            print("Here are the ingredients that have been flagged as high risk:")
            for x in dic["high"]:
                print(x)
            '''
        if len(dic["med"]) > 0:
            if dic["risk"] == "":
                dic["risk"] = "medium"
            '''
            print("Here are the ingredients that have been flagged as medium risk:")
            for x in dic["med"]:
                print(x)
            '''
        if len(dic["med"]) == 0 and len(dic["high"]) == 0:
            dic["risk"] = "low"
            #print("Your product has low-no microplastic contamination!")
        return dic

    ret = []


    '''
    for x in items:
        print(x)
    '''

    for x in items:
        ret.append(risk_display(x))

    with open("scraper_results.txt", "w") as file:
        json.dump(ret, file, indent=4)

    print(json.dumps(ret, indent=4))
    '''
    print("related products: ")
    relateds = soup.find_all('div', class_ = "bottom-recommendation-section")
    pref = soup.find_all('div', attrs ={'class':'cardingtitle brandtitlebox-v2 previewbox-greytext'})
    print(relateds)
    print(pref)
    for related in relateds:
        print(related.text)
    '''

if len(sys.argv) > 1:
    product_name = " ".join(sys.argv[1:])
    retrieve_risk_rating_for_search(product_name)
else:
    print(json.dumps({"error": "No product name provided"}))