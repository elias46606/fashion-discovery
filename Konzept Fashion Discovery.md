# Fashion Discovery — Konzeptdokument

*Eine Discovery-Engine für Mode: Der Nutzer beschreibt, was er sucht — ein unabhängiger Algorithmus führt ihn zur passenden, authentischen Marke. Der Fokus liegt bewusst auf der Entdeckung kleiner, unabhängiger Labels.*

---

## 1. Vision

Es gibt tausende Marken, und Menschen wissen nicht, welches etablierte, authentische Label genau das macht, was sie im Kopf haben — im richtigen Stil, in der richtigen Qualität, zum passenden Preis. Google liefert SEO-Müll und Anzeigen; Fast Fashion überschwemmt die Ergebnisse.

Das Produkt verkauft also nicht Kleidung, sondern **Vertrauen und Kuration**: *„Beschreib, was du suchst — und ich zeige dir eine echte Marke, die das wirklich gut macht."*

Der eigentliche Vermögenswert ist mit der Zeit nicht der Algorithmus, sondern die **kuratierte Marken-Datenbank** mit sauberen Attributen (Stil, Preisklasse, Material, Herkunft, Echtheits-Signale). Sie ist der Burggraben.

---

## 2. Geschäftsmodell

**Phase 1 — Qualität beweisen (Start):** Kostenlos, kein Geld von Marken. Solange keine Zahlung fließt, hat der Algorithmus keinen Grund zu lügen. Ziel: beweisen, dass die Kuration die beste ist.

**Phase 2 — Monetarisierung (später):**
- **Günstiges Abo** für die Nutzer — finanziert die ehrliche Unabhängigkeit.
- **Affiliate-Provision** — aber nur bei Shops, die es ohnehin anbieten.

### Die eiserne Firewall
> **Ob eine Marke Affiliate-Provision zahlt, darf NIEMALS ins Ranking einfließen.**

Affiliate ist eine reine **Anzeige-Eigenschaft** *nach* dem Matching. Das eigentliche Match basiert ausschließlich auf Echtheit, Stil, Qualität und Entdeckungswert. Diese Trennung wird von Anfang an im Datenmodell verankert (getrennte Felder), damit späteres Geld die Kuration nicht verderben kann.

---

## 3. Architektur: Zwei Tore

Jede Marke durchläuft **beide** Tore — es ist kein Entweder-oder.

| | Frage | Typ |
|---|---|---|
| **Tor 1** | Ist die Marke echt & authentisch? | Hartes Gate (rein / raus) |
| **Tor 2** | Wie relevant & wie entdeckenswert? | Filter + Sortierung |

---

## 4. Tor 1 — Der Echtheits-Trichter

Leitprinzip:
> **Echtheit ist ein Netzwerk. Fake ist eine Insel.**

Eine Marke wird nicht danach beurteilt, was sie über sich selbst sagt (das ist fälschbar), sondern nach der Gesellschaft, in der sie sich bewegt (das ist schwer zu fälschen). Aufbau als Trichter — billige, automatische Checks zuerst, teure Urteils-Checks danach:

**1. Identifikation** — Welche Marke ist überhaupt gemeint? Namensvetter trennen (z. B. die zwei „PESO": deutsches Streetwear-Label vs. philippinischer T-Shirt-Druck).

**2. Kill-Switches** *(automatisch, sofort raus)*
- Reverse-Image-Treffer auf AliExpress/Alibaba → Dropshipper
- Inkohärenter Katalog (Uhren + Kleidung + Gadgets) → Wiederverkäufer, kein Label
- Generische SEO-Shop-Signatur („Worldwide Free Shipping", austauschbare Texte, Fake-Scarcity, erfundene Presse-Badges)

**3. Echtheits-Check** *(für die Überlebenden)*
- Eigene, konsistente Bildsprache (selbst produziert, nicht Stock)
- Gründer sichtbar / echtes Gesicht hinter der Marke
- Enger, zusammenhängender Stil

**4. Netzwerk-Bestätigung** *(das Unfälschbare — mindestens EINS Pflicht)*
- Trustpilot-Historie mit echtem Volumen & namentlichem Support
- Echte fremde Träger (organisches UGC, nicht die Marke selbst)
- Stockists: wird von kuratierten Multibrand-Stores geführt

**5. Watchlist** — Echt + kohärent, aber noch ohne Netzwerk-Signal → wird **geparkt**, nicht abgelehnt. Automatische Neuprüfung, sobald die Szene reagiert. So geht kein Aufsteiger verloren, aber Nutzer sehen nur extern bestätigte Marken.

### Zwei „Fake"-Kategorien (nicht verwechseln)
- **Dropshipper** = echtes, aber mieses Geschäft. Existiert, liefert Müll.
- **Fake-/Klon-Seite** = gar kein Geschäft. Imitiert eine echte Marke (gestohlene Fotos) oder reiner Betrug. Erkennung: gestohlene Fotos haben Reverse-Image-Treffer bei der echten Marke; der Klon hat **keine** eigene Trustpilot-/Social-Historie. Die echte Spur lässt sich nicht über Nacht fälschen.

---

## 5. Tor 2 — Das Entdeckungs-Ranking

Ranking ist **zwei unabhängige Achsen**, die getrennt und dann verheiratet werden:

- **Achse 1 — Relevanz:** Passt die Marke zur Suche? (Richtiges Teil, richtiger Stil?)
- **Achse 2 — Entdeckungswert:** Wie unbekannt/unabhängig? (Anovair › PESO › Nike)

### Die Kernregel
> **Relevanz ist das Tor. Entdeckungswert ist die Sortierung dahinter.**

Zuerst hart auf relevante Marken filtern (alles unter der Relevanz-Schwelle fliegt raus, egal wie cool). *Innerhalb* der relevanten Menge nach Entdeckungswert sortieren — die kleinste, unbekannteste zuerst.

> **Leitsatz: Bekanntheit senkt das Ranking, nicht die Qualität.** (Genau umgekehrt zu Google — das ist das Alleinstellungsmerkmal.)

### Ergebnisseite: zwei getrennte Bereiche
- **Treffer** *(hartes Relevanz-Tor):* „Diese Marken machen genau das" — nach Entdeckungswert sortiert. Verkauft **Verlässlichkeit**.
- **Ähnliche Marken entdecken** *(elastische Zone):* „Falls du offen bist — im Geiste verwandt." Optisch klar abgesetzt. Verkauft **Entdeckung**. Darf mutig sein, ohne das Vertrauen oben zu gefährden.

### Der Bekanntheits-Score (für die Entdeckungs-Sortierung)
Misst **nicht** Unternehmensgröße, sondern: *„Wie wahrscheinlich kennt mein Nutzer diese Marke schon?"*

| Faktor | Gewicht | Misst |
|---|---|---|
| **Suchvolumen** | hoch | Wie viele suchen aktiv nach ihr? (schwer fälschbar) |
| **Stockist-Reichweite** | mittel | Wie tief im Handel verankert? |
| **Follower** | klein (nur Stütze) | grobe Plausibilität (leicht gekauft) |

- Hoher Score → ganz nach unten (Nike). Niedriger Score → ganz nach oben (Anovair, Tectum).
- **Relativ, nicht absolut:** Normalisierung *innerhalb* der Ergebnismenge einer Suche, nicht global.

### Frische-Bonus
Ein kleiner, zeitlich begrenzter Schub (erste ~6–12 Monate) nach oben in der Entdeckungs-Sortierung. „Neu *und* schon validiert" ist oft der spannendste Treffer.
- Leitplanke 1: **Nur nach vollständig bestandenem Tor 1** — nie für Watchlist-Marken.
- Leitplanke 2: **Klein** — ein Schubs, kein Katapult. Überstimmt niemals Relevanz oder echte Bekanntheit. Schützt vor „Relaunch"-Tricks.

---

## 6. Erfolgsmessung — der Nordstern

Standard-Web-Metriken (Klicks, Verweildauer) sind hier fast wertlos: Lange Verweildauer kann Begeisterung *oder* Frust bedeuten — dieselbe Zahl, gegenteilige Bedeutung. Was wirklich zählt, sind zwei getrennte Achsen, die auseinanderfallen können:

1. **War der Vorschlag richtig?** (Relevanz)
2. **War der Vorschlag eine Entdeckung?** (Entdeckungswert)

### Die zwei Mikro-Signale (sehr leichtgewichtig)
Unter jedem Vorschlag zwei winzige Taps — kein Formular, zweite Frage erscheint erst nach dem ersten Tap:
1. *Kanntest du die Marke schon?* → **Ja / Nein**
2. *Passt sie zu deiner Suche?* → **👍 / 👎**

### Diagnose-Matrix

| | 👍 passt | 👎 passt nicht |
|---|---|---|
| **Neu** (kannte ich nicht) | 🎯 **Volltreffer — der Nordstern** | Relevanz-Tor zu weich → härter ziehen |
| **Bekannt** (kannte ich schon) | korrekt, aber langweilig → Bekanntheit stärker abwerten | Totalausfall |

Jeder Quadrant = eine andere Krankheit mit einer anderen Behandlung. Das ist der ganze Wert der Trennung.

### Nordstern als eine Zahl
Anteil **„🎯 Volltreffer"** (neu + passt) an allen bewerteten Vorschlägen. Steigt diese Rate, wird die Seite besser — egal was Klicks/Verweildauer sagen.

**Zwei ehrliche Vorbehalte:**
- *Selektions-Verzerrung:* Wer bewertet, ist nicht der Durchschnitt (Begeisterte/Verärgerte antworten häufiger). Die absolute Zahl mit Vorsicht — aber der **Trend über Zeit** ist ehrlich.
- *„Kannte ich schon" ist subjektiv* — und das ist gut: misst gefühlte Bekanntheit aus Nutzersicht. Abgleich mit dem Bekanntheits-Score zeigt, wo der Score danebenliegt.

---

## 7. Leitprinzipien auf einen Blick

1. **Echtheit ist ein Netzwerk, Fake ist eine Insel.**
2. **Relevanz ist das Tor, Entdeckungswert die Sortierung.**
3. **Bekanntheit senkt das Ranking, nicht die Qualität.**
4. **Affiliate-Geld berührt das Ranking nie** — reine Anzeige-Eigenschaft.
5. **Kleine Labels sind der Schatz; die Giganten sind nur der Notnagel.**

---

## 8. Referenz: Geschmacksprofil (Goldstandard)

Abgeleitet aus den Beispiel-Marken. Definiert *den Maßstab*, nicht die fixe Markenliste.

- **Lane:** Zeitgenössische, „elevated" Streetwear / Archive — nicht Luxus, nicht Basics, nicht Wegwerfware
- **Struktur:** Eigenständige Identität, oft gründergeführt, Drop-getrieben
- **Reife:** breit (von 1980 bis 3 Jahre alt) — „etabliert" heißt *authentische Identität*, nicht *alt*
- **Preis:** mittleres bis oberes Contemporary-Segment
- **Starkes europäisches / deutsches Independent-Rückgrat**

**Top-Tier (max. Entdeckungswert):** PESO, 6PM, Systemic, Anovair, Pequs, ére studios, sacralite, Joseph Atelier u. v. m.
**Mitte (kennt man schon):** Stüssy, Corteiz, Represent, Polo Ralph Lauren, Diesel
**Unten (Notnagel):** Nike, Adidas, Zara, H&M

**Negativ-/Grenzbeispiele zum Lernen:** Zara/H&M (Fast Fashion — kommen nur ganz unten durch); One Block Down (Multibrand-Store, kein Label); SNKRADDICTED (Media-Account, kein Label).

---

## 9. Stil-Matching & Pipeline (Hybrid)

**Entscheidung: Tags zuerst, Embeddings als zweite Schicht.** Tags zwingen dazu, das Geschmacksprofil explizit zu machen (= Burggraben-Arbeit), sind transparent (man sieht *warum* etwas matcht) und laufen sofort. Embeddings entfalten ihre Magie erst bei guten, umfangreichen Beschreibungen — die erst aufgebaut werden müssen.

**Rollenverteilung — spiegelt die zwei Ergebnis-Bereiche:**
- **Tags** = hartes Relevanz-Tor → **Treffer-Zone** (verlässlich, transparent)
- **Embeddings** = nuancierte Nähe → **„Ähnliche Marken"-Zone** (überraschend; Blackbox stört hier am wenigsten)

### Tag-Schema (drei strikt getrennte Sorten)

**1. Stil-Tags — entscheiden Relevanz (hartes Tor):**
- *Teil-Typ:* tee · hemd · hoodie · sweat · hose · denim · strick · jacke · mantel
- *Schnitt/Fit:* oversized · boxy · regular · slim · skinny · straight · relaxed · baggy · wide-leg · cropped · tailored
- *Ästhetik/Vibe:* minimal · workwear · outdoor · archive · military · vintage · technical · elevated-basics · grunge · 90s
- *Palette:* earthtones · schwarz/mono · washed · clean-white · bold
- *Material:* heavyweight-cotton · wolle · technical · raw-denim · cut-and-sew

**2. Ranking-Attribute — nur Reihenfolge, nie Relevanz:**
- Bekanntheits-Score (1–5) · Tier (indie / etabliert / mainstream) · Frische

**3. Neutrale Felder — nie im Matching:**
- Affiliate vorhanden? · Herkunft · Preis-Range · Shop-Link · Stockists

**4. Passform / Verfügbarkeit — eigener Filter, NICHT im Stil-Matching (gestuft):**
- *Stufe 1 (jetzt, stabil):* Größensystem der Marke — numerisch (z. B. 30–36 Waist) · Alpha (XS–XXL) · Einheitsgröße / oversized-only. Einmal pflegbar. Erlaubt groben Filter „führt meine Range grundsätzlich".
- *Stufe 2 (später, schwer):* Live-Verfügbarkeit pro Produkt (z. B. „32/34 lieferbar?") — nur bei Marken mit Shop-Feed/Affiliate-Schnittstelle. Eigenes Daten-Projekt, kein Tag. Bei kleinen Drop-Labels oft nicht verfügbar (keine API, Teil nach Drop weg).

> Größe sagt nicht, *ob* eine Marke passt (Stil), sondern ob das Teil *physisch passt*. Deshalb ein **Filter nach dem Matching**, nie ein Relevanz-Kriterium — sonst fällt eine perfekte Marke raus, nur weil eine Größe ausverkauft ist. Ehrliches Versprechen Stufe 1: „führt deine Größenrange", nicht „sofort lieferbar".

> Die Trennung ist **strukturell**: „Geld" (Affiliate) liegt in Sorte 3 und kann das Matching gar nicht berühren — die Firewall ist im Schema eingebaut, nicht nur Absicht.

### Der Übersetzer (löst die Tag-Starrheit)
Zwischen Suche und Matching sitzt ein kleiner **Claude-API-Aufruf**, der freie Eingabe ins kontrollierte Tag-Vokabular übersetzt: *„90er Hip-Hop-Vibe, baggy"* → `90s` + `baggy` + `streetwear`. So bleibt das Matching transparent (Tags), aber das *Verstehen* der Suche wird flexibel — die Embedding-Magie genau dort, wo sie hilft, ohne Blackbox im Kern.

### Pipeline (komplett)
> Suche → **Claude übersetzt in Tags** → Tag-Überschneidung filtert (Treffer-Zone) → *optional Größenfilter Stufe 1* → Bekanntheits-Score sortiert (Frische-Bonus) → **Embeddings** liefern die „Ähnliche Marken"-Zone

---

## 10. Offene Punkte & nächste Schritte

**Konzept abgeschlossen.** Nächste Phase: Bauen (Claude Code).

1. **Seed-Datensatz** — 20–30 reale Marken aus der Liste, von Hand nach dem Tag-Schema getaggt. Klein, aber echt = Goldstandard.
2. **Tag-Matching** für die Treffer-Zone (hartes Tor + Bekanntheits-Sortierung).
3. **Übersetzer** (Claude-API) für freie Sucheingaben.
4. **Prototyp A anschließen** — UI steht, bekommt statt Musterdaten echte Ergebnisse.
5. *Später:* Embeddings für die „Ähnliche Marken"-Zone · Entdeckungs-Mechanismus für neue Kandidaten (immer gegen den Goldstandard geprüft) · Ausbau auf 50–150 Marken.

---

*Stand: Konzeptphase vollständig abgeschlossen (Geschäftsmodell, Tor 1, Tor 2, Erfolgsmessung, Stil-Matching). Nächster Schritt: Bauen in Claude Code — siehe separate Bauanleitung.*
