/* goals.js: the personal goal */
const saveGoal=text=>{S.goal=text;return save(['goals'],o=>o.goals.put({id:'main_goal',text}))};

