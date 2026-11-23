# Product descriptions and SEO meta descriptions (UX-03, 23/11/2026).
# Only facts we know from each product (name, type, size, pet); no invented ingredients,
# percentages or health claims. When the real product arrives, complete them with the packaging.
# Each entry: handle -> (intro, [bullets], closing note or "", seo description <= 155 chars)

PIENSO_NOTE = "Cambia de pienso poco a poco, en unos 7 días, mezclándolo con el anterior. La ración diaria y la composición están en el envase; también puedes usar la calculadora «¿Cuánto le doy al día?» de esta página."
LATA_NOTE = "Una vez abierta, guárdala tapada en la nevera y gástala en 2 o 3 días. La ración y la composición están en el envase."
BARF_NOTE = "Descongélalo en la nevera, no a temperatura ambiente, y no lo vuelvas a congelar. Se envía refrigerado en caja isotérmica, solo a la península."
TOY_NOTE = "Vigílale mientras juega y retira el juguete si se rompe o se desgasta."
SNACK_NOTE = "Son premios: no sustituyen a la comida. Ten siempre agua fresca a su alcance."
SUPP_NOTE = "Sigue la dosis del envase. Si tu mascota toma medicación o tiene algún problema de salud, consúltalo antes con tu veterinario."

TEXTS = {
    # Pienso
    "pienso-pollo-cachorro": (
        "Pienso seco con pollo para cachorros, pensado para la etapa de crecimiento.",
        ["Para perros cachorros.", "Saco de 3 kg o de 12 kg.", "Los cachorros comen varias veces al día: reparte la ración en 3 o 4 tomas."],
        PIENSO_NOTE,
        "Pienso seco con pollo para cachorros. Saco de 3 kg o 12 kg. Envío gratis desde 50 € a la península.",
    ),
    "pienso-senior-pollo-arroz-perro": (
        "Pienso seco con pollo y arroz para perros mayores.",
        ["Para perros senior.", "Saco de 3 kg o de 12 kg."],
        PIENSO_NOTE,
        "Pienso seco con pollo y arroz para perros senior. Saco de 3 kg o 12 kg. Envío gratis desde 50 € a la península.",
    ),
    "pienso-hipoalergenico-salmon-perro": (
        "Pienso seco para perro adulto con salmón y patata, sin cereales, pensado como opción hipoalergénica.",
        ["Para perros adultos, también con estómago o piel sensibles.", "Sin cereales.", "Saco de 3 kg o de 12 kg."],
        PIENSO_NOTE + " Si sospechas de una alergia alimentaria, consúltalo con tu veterinario.",
        "Pienso hipoalergénico sin cereales con salmón y patata para perro adulto. 3 kg o 12 kg. Envío gratis desde 50 €.",
    ),
    "pienso-light-control-peso-perro": (
        "Pienso seco bajo en grasa para perros adultos con tendencia a coger peso.",
        ["Para perros adultos.", "Bajo en grasa."],
        PIENSO_NOTE + " Para que funcione, pesa la ración y no te pases con los premios.",
        "Pienso light bajo en grasa para perros adultos con tendencia a coger peso. Envío gratis desde 50 € a la península.",
    ),
    "pienso-gatito-pollo": (
        "Pienso seco con pollo para gatitos.",
        ["Para gatitos.", "Bolsa de 1,5 kg o de 4 kg."],
        PIENSO_NOTE,
        "Pienso seco con pollo para gatitos. Bolsa de 1,5 kg o 4 kg. Envío gratis desde 50 € a la península.",
    ),
    "pienso-gato-estirilizado": (
        "Pienso seco para gatos esterilizados.",
        ["Para gatos adultos esterilizados.", "Bolsa de 1,5 kg."],
        PIENSO_NOTE,
        "Pienso seco para gatos esterilizados, bolsa de 1,5 kg. Envío gratis desde 50 € a la península.",
    ),
    "pienso-gato-digestion-sensible-pavo": (
        "Pienso seco con pavo para gatos adultos con digestión sensible.",
        ["Para gatos adultos."],
        PIENSO_NOTE,
        "Pienso seco con pavo para gatos adultos con digestión sensible. Envío gratis desde 50 € a la península.",
    ),
    "pienso-gato-control-bolas-pelo": (
        "Pienso seco para gatos adultos con fibra, para ayudar a eliminar las bolas de pelo.",
        ["Para gatos adultos.", "Con fibra."],
        PIENSO_NOTE + " Cepillarle a menudo también ayuda a que trague menos pelo.",
        "Pienso seco con fibra para ayudar a eliminar las bolas de pelo del gato adulto. Envío gratis desde 50 €.",
    ),
    # Comida húmeda
    "lata-pate-perro-adulto": (
        "Paté de comida húmeda para perros adultos.",
        ["Para perros adultos.", "Lata de 400 g.", "Puedes darlo solo o mezclado con su pienso."],
        LATA_NOTE,
        "Lata de paté de comida húmeda para perro adulto, 400 g. Envío gratis desde 50 € a la península.",
    ),
    "lata-cordero-monoproteina-perro": (
        "Comida húmeda para perro con una sola proteína animal: cordero.",
        ["Para perros adultos, también con piel o estómago sensibles.", "Monoproteína (cordero).", "Lata de 400 g."],
        LATA_NOTE,
        "Comida húmeda monoproteína de cordero para perro, lata de 400 g. Envío gratis desde 50 € a la península.",
    ),
    "lata-para-gatos-de-conejo": (
        "Comida húmeda con conejo para gatos.",
        ["Para gatos adultos."],
        LATA_NOTE,
        "Lata de comida húmeda con conejo para gatos. Envío gratis desde 50 € a la península.",
    ),
    "lata-gato-senior-atun": (
        "Comida húmeda con atún para gatos mayores.",
        ["Para gatos senior.", "Lata de 85 g."],
        LATA_NOTE,
        "Comida húmeda con atún para gato senior, lata de 85 g. Envío gratis desde 50 € a la península.",
    ),
    "sobres-gatito-pollo-salsa": (
        "Sobres de comida húmeda para gatitos: pollo en salsa.",
        ["Para gatitos.", "Caja de 12 sobres de 85 g."],
        "Un sobre abierto se guarda tapado en la nevera y se gasta en el día. La ración y la composición están en el envase.",
        "Caja de 12 sobres de 85 g de pollo en salsa para gatitos. Envío gratis desde 50 € a la península.",
    ),
    # BARF
    "menu-barf-pollo-verduras-perro": (
        "Menú de comida cruda (BARF) para perro adulto con pollo y verduras, listo para servir una vez descongelado.",
        ["Para perros adultos.", "Congelado: 2 bandejas de 500 g."],
        BARF_NOTE,
        "Menú BARF congelado de pollo y verduras para perro adulto, 2 × 500 g. Envío refrigerado a la península.",
    ),
    "menu-barf-ternera-cordero-perro": (
        "Menú de comida cruda (BARF) para perro adulto con ternera y cordero, listo para servir una vez descongelado.",
        ["Para perros adultos.", "Congelado: 2 bandejas de 500 g."],
        BARF_NOTE,
        "Menú BARF congelado de ternera y cordero para perro adulto, 2 × 500 g. Envío refrigerado a la península.",
    ),
    "cuellos-pollo-barf-perro": (
        "Cuellos de pollo crudos para perro, el hueso carnoso habitual de la dieta BARF.",
        ["Para perros adultos.", "Congelado: bolsa de 1 kg.", "Dáselos siempre crudos, nunca cocinados, y vigílale mientras come."],
        BARF_NOTE,
        "Cuellos de pollo crudos congelados para la dieta BARF del perro, bolsa de 1 kg. Envío refrigerado a la península.",
    ),
    "mezcla-verduras-algas-barf-perro": (
        "Mezcla deshidratada de verduras y algas para completar los menús BARF del perro.",
        ["Para perros adultos.", "Bote de 400 g.", "No necesita frío: se guarda en un lugar fresco y seco."],
        "La cantidad para cada comida está en el envase.",
        "Mezcla deshidratada de verduras y algas para completar la dieta BARF del perro, bote de 400 g.",
    ),
    "pack-barf-iniciacion": (
        "Todo lo necesario para empezar con la dieta BARF, un 10 % más barato que comprar los productos por separado.",
        ["Menú BARF de pollo y verduras (2 × 500 g).", "Menú BARF de ternera y cordero (2 × 500 g).", "Cuellos de pollo (1 kg).", "Mezcla de verduras y algas (400 g)."],
        BARF_NOTE + " Si es la primera vez que tu perro come BARF, haz el cambio poco a poco.",
        "Pack para empezar con la dieta BARF: dos menús, cuellos de pollo y mezcla de verduras, 10 % más barato que por separado.",
    ),
    # Snacks
    "snack-dental-perro": (
        "Snack para que el perro mastique y ayudar a su higiene dental entre limpiezas.",
        ["Para perros."],
        SNACK_NOTE + " No sustituye al cepillado ni a las revisiones del veterinario.",
        "Snack dental para perro: un premio para masticar que ayuda a su higiene dental. Envío gratis desde 50 €.",
    ),
    "oreja-de-cerdo": (
        "Oreja de cerdo para que el perro mastique.",
        ["Para perros."],
        SNACK_NOTE + " Vigílale mientras la come.",
        "Oreja de cerdo para perro, un premio para masticar. Envío gratis desde 50 € a la península.",
    ),
    "snack-insecto-hipoalergenico-perro": (
        "Premios para perro con proteína de insecto, una opción para perros con alergias o intolerancias.",
        ["Para perros, también con piel o estómago sensibles.", "Bolsa de 100 g."],
        SNACK_NOTE,
        "Premios hipoalergénicos con proteína de insecto para perro, bolsa de 100 g. Envío gratis desde 50 €.",
    ),
    "chips-manzana-zanahoria-perro": (
        "Premios deshidratados de manzana y zanahoria para perro.",
        ["Para perros.", "Bolsa de 80 g."],
        SNACK_NOTE,
        "Premios deshidratados de manzana y zanahoria para perro, bolsa de 80 g. Envío gratis desde 50 €.",
    ),
    "snack-malta-gatos": (
        "Premios para gato rellenos de malta.",
        ["Para gatos.", "Bolsa de 60 g."],
        SNACK_NOTE,
        "Premios para gato rellenos de malta, bolsa de 60 g. Envío gratis desde 50 € a la península.",
    ),
    # Suplementos
    "aceite-de-salmon": (
        "Aceite de salmón para añadir a la comida de perros y gatos.",
        ["Para perros y gatos.", "Botella de 250 ml."],
        SUPP_NOTE,
        "Aceite de salmón para perros y gatos, botella de 250 ml. Envío gratis desde 50 € a la península.",
    ),
    "malta": (
        "Malta para gatos, para ayudar a expulsar las bolas de pelo.",
        ["Para gatos."],
        SUPP_NOTE,
        "Malta para gatos que ayuda a expulsar las bolas de pelo. Envío gratis desde 50 € a la península.",
    ),
    "suplemento-articulaciones-perro-senior": (
        "Comprimidos masticables para las articulaciones del perro mayor.",
        ["Para perros senior.", "Bote de 60 comprimidos."],
        SUPP_NOTE,
        "Comprimidos masticables para las articulaciones del perro senior, 60 unidades. Envío gratis desde 50 €.",
    ),
    "probiotico-digestivo-perro-gato": (
        "Probiótico en polvo para perros y gatos, para mezclar con la comida.",
        ["Para perros y gatos.", "Caja de 30 sobres."],
        SUPP_NOTE,
        "Probiótico digestivo en polvo para perro y gato, 30 sobres. Envío gratis desde 50 € a la península.",
    ),
    # Higiene
    "champu-avena-perro": (
        "Champú de avena para perro.",
        ["Para perros de todas las edades.", "Botella de 250 ml."],
        "Moja bien el pelo, aplica, masajea y aclara a fondo con agua tibia. Evita los ojos. Bañarlo demasiado reseca la piel: cada 3-4 semanas suele bastar.",
        "Champú de avena para perro, 250 ml. Envío gratis desde 50 € a la península.",
    ),
    "champu-hipoalergenico-piel-sensible-perro": (
        "Champú suave sin perfume para perros con piel sensible.",
        ["Para perros con piel sensible.", "Sin perfume.", "Botella de 250 ml."],
        "Moja bien el pelo, aplica, masajea y aclara a fondo con agua tibia. Evita los ojos. Si la piel está irritada o tiene heridas, consulta antes con tu veterinario.",
        "Champú hipoalergénico sin perfume para perros con piel sensible, 250 ml. Envío gratis desde 50 €.",
    ),
    "balsamo-almohadillas-perro": (
        "Bálsamo para cuidar las almohadillas del perro.",
        ["Para perros.", "Aplícalo después del paseo, con las almohadillas limpias y secas."],
        "Si hay heridas o grietas profundas, consulta con tu veterinario.",
        "Bálsamo para las almohadillas del perro: aplícalo tras el paseo. Envío gratis desde 50 € a la península.",
    ),
    "cepillo-deslanador-perro-gato": (
        "Cepillo para retirar el pelo muerto de perros y gatos.",
        ["Para perros y gatos.", "Úsalo antes del baño para quitar el pelo muerto y los nudos."],
        "Cepilla a favor del pelo y sin apretar. En épocas de muda, 2 o 3 veces por semana.",
        "Cepillo deslanador para quitar el pelo muerto de perros y gatos. Envío gratis desde 50 € a la península.",
    ),
    "cortaunas": (
        "Cortauñas para gato.",
        ["Para gatos."],
        "Corta solo la punta transparente de la uña, sin llegar a la parte rosada. Si no te atreves, en nuestra peluquería te lo hacemos.",
        "Cortauñas para gato. Si no te atreves, te cortamos las uñas en nuestra peluquería. Envío gratis desde 50 €.",
    ),
    # Juguetes
    "pelota-mordedor-perro": (
        "Pelota mordedora para perro, para lanzar y morder.",
        ["Para perros."],
        TOY_NOTE,
        "Pelota mordedora para perro, para lanzar y morder. Envío gratis desde 50 € a la península.",
    ),
    "cuerda-algodon-perro": (
        "Cuerda de algodón trenzado para jugar a tirar y morder.",
        ["Para perros.", "Talla M o L."],
        TOY_NOTE,
        "Cuerda de algodón trenzado para que tu perro tire y muerda, talla M o L. Envío gratis desde 50 €.",
    ),
    "mordedor-denticion-cachorro": (
        "Mordedor de caucho blando para cachorros que están cambiando los dientes.",
        ["Para cachorros en dentición."],
        TOY_NOTE,
        "Mordedor de caucho blando para cachorros en dentición. Envío gratis desde 50 € a la península.",
    ),
    "juguete-raton": (
        "Juguete en forma de ratón para gato.",
        ["Para gatos."],
        TOY_NOTE,
        "Juguete ratón para gato. Envío gratis desde 50 € a la península.",
    ),
    "cana-plumas-gato": (
        "Caña de juego con plumas para jugar con tu gato.",
        ["Para gatos."],
        "Guárdala cuando terminéis de jugar, para que no se coma las plumas ni el hilo.",
        "Caña con plumas para jugar con tu gato. Envío gratis desde 50 € a la península.",
    ),
    "rascador-gato": (
        "Rascador para que el gato afile las uñas sin estropear los muebles.",
        ["Para gatos.", "Ponlo cerca de donde ya suele rascar."],
        "",
        "Rascador para gato: que afile las uñas sin estropear los muebles. Envío gratis desde 50 € a la península.",
    ),
    "tunel-plegable-gato": (
        "Túnel de tela plegable para que el gato juegue y se esconda.",
        ["Para gatos.", "Se pliega para guardarlo."],
        "",
        "Túnel de tela plegable para que tu gato juegue y se esconda. Envío gratis desde 50 € a la península.",
    ),
    # Accesorios
    "correa-nylon": (
        "Correa de nylon para pasear al perro.",
        ["Para perros.", "1,2 metros de largo."],
        "",
        "Correa de nylon de 1,2 m para pasear a tu perro. Envío gratis desde 50 € a la península.",
    ),
    "cama-con-pelo": (
        "Cama de pelo para que tu perro descanse.",
        ["Para perros.", "Tallas pequeña, mediana y grande."],
        "Elige una talla en la que pueda estirarse del todo.",
        "Cama de pelo para perro en talla pequeña, mediana o grande. Envío gratis desde 50 € a la península.",
    ),
    "arbol": (
        "Árbol rascador para que el gato trepe, rasque y descanse.",
        ["Para gatos."],
        "Colócalo en un sitio estable, cerca de una ventana si puede ser.",
        "Árbol rascador para que tu gato trepe, rasque y descanse. Envío gratis desde 50 € a la península.",
    ),
}
