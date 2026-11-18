# One list of flavours, shared by the static-site and Shopify updates.
# (handle, English name, French name, English description, French description, badge, pack band colour, card tint)
FLAVOURS = [
    ('salted-chocolate-chunk', 'Salted Chocolate Chunk', 'Chocolat & fleur de sel',
     'Thin and wide with crisp, caramelised edges, pools of dark chocolate and flaky sea salt.',
     'Mince et large, aux bords croustillants et caramélisés, avec des flaques de chocolat noir et de la fleur de sel.',
     'Best seller', '#b9773a', '#f3e3cf'),
    ('chocolate-stuffed', 'Chocolate Stuffed', 'Fourré au chocolat',
     'Thick and soft, with a molten chocolate centre and a milk chocolate drizzle.',
     'Épais et moelleux, au cœur de chocolat fondant, avec un filet de chocolat au lait.',
     '', '#4d2a1c', '#eddcd0'),
    ('pistachio-stuffed', 'Pistachio Stuffed', 'Fourré à la pistache',
     'Filled with pistachio cream and finished with crushed pistachios.',
     'Garni de crème de pistache et parsemé de pistaches concassées.',
     'Fan favourite', '#7c9440', '#e5ead3'),
    ('oatmeal-chocolate-chunk', 'Oatmeal Chocolate Chunk', 'Avoine et chocolat',
     'Chewy oats, brown sugar and dark chocolate chunks.',
     'Flocons d’avoine moelleux, cassonade et gros morceaux de chocolat noir.',
     'New', '#8a5a2b', '#efe0cc'),
    ('cookies-and-cream', 'Cookies & Cream', 'Biscuits et crème',
     'Vanilla dough loaded with chocolate cookie pieces, a white chocolate drizzle and a mini chocolate sandwich cookie on top.',
     'Pâte à la vanille garnie de morceaux de biscuits au chocolat, d’un filet de chocolat blanc et d’un mini biscuit sandwich au chocolat.',
     'New', '#2f2a2b', '#e8e4e2'),
    ('cinnamon-sugar', 'Cinnamon Sugar', 'Sucre à la cannelle',
     'Soft and thick, rolled in cinnamon sugar before baking.',
     'Épais et moelleux, roulé dans le sucre à la cannelle avant la cuisson.',
     'New', '#a8562a', '#f4dccb'),
]

FLAVOURS += [
    ('white-chocolate-glazed', 'White Chocolate Glazed', 'Glacé au chocolat blanc',
     'Soft vanilla cookie finished with a smooth white chocolate glaze.',
     'Biscuit moelleux à la vanille recouvert d’un glaçage lisse au chocolat blanc.',
     '', '#9a7b4f', '#f3ece0'),
    ('blueberry-glazed', 'Blueberry Glazed', 'Bleuets et glaçage',
     'Packed with blueberries and finished with a sweet vanilla glaze.',
     'Rempli de bleuets et nappé d’un glaçage sucré à la vanille.',
     '', '#4a4f8a', '#e3e4ef'),
    ('cinnamon-roll', 'Cinnamon Roll', 'Roulé à la cannelle',
     'Swirled with cinnamon sugar and topped with a cream glaze, like a cinnamon bun in cookie form.',
     'Tourbillons de sucre à la cannelle et glaçage à la crème, comme une brioche à la cannelle en version biscuit.',
     '', '#9c5a2c', '#f2e2cf'),
    ('almond-amaretti', 'Almond Amaretti', 'Amaretti aux amandes',
     'Chewy almond cookie rolled in icing sugar and topped with a whole almond.',
     'Biscuit moelleux aux amandes roulé dans le sucre glace et garni d’une amande entière.',
     '', '#8f6a4a', '#f1ebe3'),
    ('salted-pistachio', 'Salted Pistachio', 'Pistache et fleur de sel',
     'Thin and chewy brown-sugar cookie with pistachio pieces and flaky sea salt.',
     'Biscuit mince et moelleux à la cassonade, avec des éclats de pistache et de la fleur de sel.',
     '', '#5f7a36', '#e9ead5'),
]
NUTS = {'pistachio-stuffed', 'almond-amaretti', 'salted-pistachio'}

# Catalog groups (wholesale catalog filters)
CATEGORIES = [
    ('classic', 'Classics', 'Classiques'),
    ('stuffed', 'Stuffed', 'Fourrés'),
    ('glazed', 'Glazed & drizzled', 'Glacés et nappés'),
    ('specialty', 'Specialty', 'Spécialités'),
]
CATEGORY = {
    'salted-chocolate-chunk': 'classic', 'oatmeal-chocolate-chunk': 'classic', 'cinnamon-sugar': 'classic', 'salted-pistachio': 'classic',
    'chocolate-stuffed': 'stuffed', 'pistachio-stuffed': 'stuffed',
    'cookies-and-cream': 'glazed', 'white-chocolate-glazed': 'glazed', 'blueberry-glazed': 'glazed', 'cinnamon-roll': 'glazed',
    'almond-amaretti': 'specialty',
}

# Item codes (Shopify SKU for a single wrapped cookie)
SKU = {
    'salted-chocolate-chunk': 'LDN-SCC-1', 'chocolate-stuffed': 'LDN-CHS-1', 'pistachio-stuffed': 'LDN-PIS-1',
    'oatmeal-chocolate-chunk': 'LDN-OAT-1', 'cookies-and-cream': 'LDN-CNC-1', 'cinnamon-sugar': 'LDN-CIN-1',
    'white-chocolate-glazed': 'LDN-WCG-1', 'blueberry-glazed': 'LDN-BLG-1', 'cinnamon-roll': 'LDN-CRL-1',
    'almond-amaretti': 'LDN-AMA-1', 'salted-pistachio': 'LDN-SPI-1',
}
