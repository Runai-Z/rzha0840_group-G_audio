# rzha0840_group-G_audio

## Instructions on how to interact with the work
### After loading the page, the animation starts automatically. The dot rings begin to pulse with a breathing rhythm, and each dot’s colour shifts gradually between lighter and darker tones. Chain links also slowly shift colour every second. The motion is entirely time-driven, producing a meditative, evolving effect that unfolds continuously without user input.

---

## Details of my individual approach to animating the group code  
- **I chose Time as the method to drive my individual code.**

---

- **The properties that are animated and how they are animated**
  - I focused on the 'DotRing' class. I introduced a “breathing” animation where each concentric ring of dots expands and contracts slightly over time. This is achieved using a sine wave based on 'frameCount', giving a rhythmic pulse from the innermost to the outermost rings.
  - In addition to movement, I modified each dot’s colour brightness based on its breathing state. The colour brightness oscillates from light to dark and back, creating a synchronised visual pulse using HSB colour mode.
  - Each ring has a slight offset in its breathing cycle ('+i' phase shift), creating a ripple-like effect across all rings rather than uniform pulsing. This gives the illusion of structural movement reminiscent of mechanical rotation, but remains entirely breathing-based.
  - I also modified the 'ChainLink' class to update its colour once every second (based on 'frameCount'), giving a slow, non-repetitive glowing effect to each link. Each chain’s timing is independent, resulting in an organic unsynchronised rhythm.

---

- **References to inspiration for animation**
###  
![Reference image](image/kusama_the_souls_of_millions_1.jpg.webp)
### 
- My animation creation was deeply inspired by Yayoi Kusama's ‘Infinity Mirror Room — Souls from a Million Light Years Away’ (2013). The layered points of light and endless reflections in the work evoke the feeling of starlight twinkling. It's as if the points of light are breathing.
###  
![Reference gif](image/37543d88b893392c593ac767995dcd61.gif)
### 
- This GIF is the most direct inspiration from the concentric circles. The pulsating rhythm, akin to breathing, accompanies the movement of the gears of time.
###  
![Reference gif](image/f10788f6299004ecebc020b9ba113cd6.gif)
### 
- This GIF was also inspired by ‘Infinity Mirror Room,’ where the pulsating motion was found through association, and the changes in brightness were used to represent the rhythm. It has a slow-motion effect reminiscent of starlight.
