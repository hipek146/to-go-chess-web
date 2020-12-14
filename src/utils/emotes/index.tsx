import React from "react";
import emote1 from "./emote1.png";
import emote2 from "./emote2.png";
import emote3 from "./emote3.png";
import emote4 from "./emote4.png";
import emote5 from "./emote5.png";
import emote6 from "./emote6.png";

const src = []

src.push(emote1);
src.push(emote2);
src.push(emote3);
src.push(emote4);
src.push(emote5);
src.push(emote6);


export default src.map((res, index) => ({index, res}));