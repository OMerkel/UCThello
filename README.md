<img alt="UCThello icon" width="64" src="html5/src/img/icons/ucthello64.png" /> UCThello
====================

* <em>Start an online</em> <b>UCThello</b> <em>session on</em> http://omerkel.github.io/UCThello/html5/src
* <em>Also published in</em> <a href="https://marketplace.firefox.com/app/ucthello"><img align="middle" width="150px" src="https://marketplace.cdn.mozilla.net/media/fireplace/img/pretty/marketplace_logo.png" /></a>
* <em>Android APK available for install</em> <img align="top" width="32" src="res/android.gif" /> https://github.com/OMerkel/UCThello/releases/tag/release_0.1
    * requires minimum Android 4.4.2 (API-19)
* <em>Runs in various browsers on</em>
    * <em>desktop systems like BSDs, Linux, Win, MacOS and</em>
    * <em>mobile platforms like Android, FirefoxOS, iOS.</em>

## Abstract

_UCThello - a board game demonstrator with computer AI using
Monte-Carlo Tree Search (MCTS) with UCB (Upper Confidence Bounds)
applied to trees (UCT in short)_

__Keywords, Categories__ _Monte-Carlo Tree Search (MCTS),
Upper Confidence Bounds (UCB), UCB applied to trees (UCT), AI,
2-player board game, deterministic game with perfect information,
JavaScript, ECMAScript, W3C WebWorker_ 

#Description

UCThello is a board game using Monte-Carlo Tree Search (MCTS) with
UCB (Upper Confidence Bounds) applied to trees (UCT in short) for the
computer player AI. The board game used for demonstration purposes of
the UCT algorithm is close to a game named _Othello_ depending on
selected options. In fact it can be played depending on your
configuration following the official tournament rules of the
WOF - World Othello Federation - if intended. Other rule settings
to play variants are available, too.

_Othello_ is a derivative of the board game _Reversi_ which can be played by UCThello as well. _Reversi_ is claimed to be invented by either Lewis Waterman or John W. Mollett. Predecessor of _Reversi_ created by Mollett is _The game of Annexation_, also called _Annex_ back in 19th century.

#Monte-Carlo Tree Search

The __Monte-Carlo Tree Search__ (MCTS in short) represents an algorithms used to build a
_Search Tree_ interatively by successively adding nodes according to traversing of
nodes and simulations in the problem domain. If the problem domain is a game then
the nodes can represent moves according to the game rules. 
Traversing nodes follows a _Selection Strategy_. _Simulations_ are often called
_playouts_, too. The different nodes inside the simulated paths get statistics
reflecting ratios of win and loss related to total amount of simulations.
Assumption is that with higher total amount of simulations the confidence in the
statistics gets high enough and allows to select quality nodes or moves. 
Such that the idea is to retrieve the acceptable next node or move with optimal
ratio then.

<img src='http://omerkel.github.io/UCThello/res/mcts_1_typical_mcts_states.svg' />

The iterative MCTS algorithm is modelled to perform four main states typically called
* _Selection_,
* _Expansion_,
* _Simulation_, and
* _Backpropagation_. See [Cha10] &amp; [CBSS08]

First step or state in an MCTS algorithm iteration is the __Selection__. _Objective
of the Selection_ is to retrieve a path beginning at the root node towards a selected
leaf node from the search tree. The Search Tree stays fixed inside the Selection state. It
grows in a later state of the algorithm by appending more nodes on each iteration of
the MCTS. Only exception is when a selected path has a final leaf node that is a
_terminal node_. A terminal node simply is a move representation of an end of game situation
according to the rules. The root node represents the current game or problem domain
situation. To traverse the search tree from the root node towards the leaf nodes
simply means to follow a possible predicted _variant_ of game play.

<img src='http://omerkel.github.io/UCThello/res/mcts_2_selection.svg' />

The _objective of the Selection Strategy_ is to branch the intended search path in
a balance of information _exploration_ and _exploitation_. If a branch is selected
following a search path branch already examined previously this is seen as an
exploit. An exploit shall confirm the quality of an already examined node in terms
of gaining higher statistical confidence. Higher statistical confidence does mean
to have more reliable estimates. Exploration is performed by creating new
nodes in later MCTS steps or alternatively search path branch selection of
relatively rare traversed nodes. Nodes traversed in a low amount simply reflects
a low reliability or statistical confidence. The border between exploit and explore
is often seen as being soft and fluent. 

Besides the Selection Strategy in search path branch Selection an additional
aspect is seen. To avoid a risk that any high quality node is unvisited that
is located near the rood node already. To reach such a design goal a possible
solution is to favor traversing any unexplored child node over following
explored siblings. Widening the search tree is then favored over deepening.
Critics could be that randomness of Monte-Carlo methods is reduced if applied.

#References

* __[Cha10]__ Guillaume Maurice Jean-Bernard Chaslot, "[Monte-Carlo Tree Search](https://project.dke.maastrichtuniversity.nl/games/files/phd/Chaslot_thesis.pdf)", PHD Proefschrift, Universiteit Maastricht, NL, 2010.
* __[CBSS08]__ Guillaume Chaslot, Sander Bakkes, Istvan Szita and Pieter Spronck, "[Monte-Carlo Tree Search: A New Framework for Game AI](http://sander.landofsand.com/publications/AIIDE08_Chaslot.pdf)", in Proceedings of the Fourth Artificial Intelligence and Interactive Digital Entertainment Conference, Stanford, California, 2008. Published by The AAAI Press, Menlo Park, California.
* Brian Rose, "[Othello. A Minute to Learn... A Lifetime to Master](http://www.ffothello.org/livres/othello-book-Brian-Rose.pdf)", 2005. 

# 3rd Party Libraries

* jQuery: MIT licensed, https://github.com/jquery/jquery
* jQuery Mobile: MIT licensed, https://github.com/jquery/jquery-mobile

#Links

* Association for the Advancement of Artificial Intelligence, http://www.aaai.org
* HTML Living Standard, Web Workers, https://html.spec.whatwg.org
* The Othello Museum, http://www.beppi.it/public/OthelloMuseum/pages/history.php

##Othello Organizations
Mind that UCThello follows (most) official tournament rules of the listed organizations depending on your selected options. Still UCThello is independent development from any work of these organizations.

* World Othello Federation, http://www.worldothello.org
* Australian Othello Federation, http://www.othello.asn.au
* British Othello Federation, http://www.britishothello.org.uk
* Dansk Othello Forbund, http://www.othello.dk
* Fédération Française d’Othello, http://www.ffothello.org 
* Federazione Nazionale Gioco Othello, Italia, http://www.fngo.it
* Malaysia Othello Association (MOA), http://z12.invisionfree.com/MOA/index.php
* Othello Club Deutschland, http://www.othello-club.de.vu
* United States Othello Association (USOA), http://www.usothello.org

#Contributors / Authors

<table>
  <tr>
    <td><p>Oliver Merkel,<br /><a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/"><img alt="Creative Commons License" style="border-width:0" src="http://i.creativecommons.org/l/by-nc-nd/4.0/88x31.png" /></a><br />This image is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/4.0/">Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License</a>.
    </p>
    </td>
    <td width="30%"><img width="100%" ondragstart="return false;" alt="Oliver Merkel, Creative Commons License, This image is licensed under a Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License." src="html5/src/img/oliver_moher-150812.jpg" /></td>
  </tr>
</table>

_All logos, brands and trademarks mentioned belong to their respective owners._
