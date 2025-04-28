# Slot machine game - new and improved

--Updates to use support multiple winning lines.  
--Updates to support drawing a line across a winning line.
--Added custom interfaces.
--Added proper use of a constants file.
--Updated checkForWin to support:
    a WINNING line has one of the following:
    	THREE_OF_A_KIND: has 3 matching symbols and no SYMBOL_WILD
        THREE_WILDS: has 3 SYMBOL_WILDs
        ONE_OR_TWO_WILDS: boolean = has 2 matching symbols and one SYMBOL_WILD 
		-or- any symbol and 2 SYMBOL_WILDs 

author: Jerry Walton
jerry.walton@symboliclanguages.com

<<< ============================================================================================== >>>
Follows is the original README.md:
<<< ============================================================================================== >>>

# Slot machine game
A simple slot machine game with three reels.

![Slots](https://user-images.githubusercontent.com/61456651/205433186-9b1e4d90-98b5-4afb-86d0-8fe9bd86c7d3.jpg)

### [Live Demo](https://asiryk.github.io/slot-game/ "Slot game")

---

#### What you need to run this code
1. Node (20.x)
2. npm (10.x)

#### How to run this code
1. Clone this repository
2. Open command line in the cloned folder,
   - To install dependencies, run ```npm install```
   - To run the application for development, run ```npm run serve```
3. Open [localhost:4200](http://localhost:4200/) in the browser

---

### Features
1. Winning: (3 symbols in a middle horizontal row)
   - 3 Same symbols
   - 2 Same symbols and 1 Wild
   - 2 Wilds and 1 any symbol
   - _**Note:**_ 3 Wilds counts as a loss
