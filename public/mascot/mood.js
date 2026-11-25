// Session-local mood: decay toward neutral, never persist or track visitors.
const positive=new Set(['happy','love','excited','proud','laughing','wink']);
const negative=new Set(['angry','confused','sad','scared','dizzy','crying']);
export function createMood(now=0,random=Math.random){
 let score=0,at=now;
 function value(time){return score*Math.exp(-Math.max(0,time-at)/18000);}
 return {
  react(name,time){score=Math.max(-3,Math.min(3,value(time)+(positive.has(name)?1:negative.has(name)?-1:0)));at=time;},
  choose(pool,last,time){const choices=pool.filter(name=>name!==last);if(!choices.length)return pool[0];
   const mood=value(time);
   const weights=choices.map(name=>Math.max(.15,1+(positive.has(name)?mood:negative.has(name)?-mood:0)*.27));
   let n=random()*weights.reduce((sum,w)=>sum+w,0);
   return choices.find((_,i)=>(n-=weights[i])<0)||choices.at(-1);
  },
  value
 };
}
