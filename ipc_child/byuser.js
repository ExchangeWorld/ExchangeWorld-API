// var byuserGen = function(ori) {
// 	return (ori * 168 + 168) * 168 - 168;
// }

// eval(function(p,a,c,k,e,d){e=function(c){return c};if(!''.replace(/^/,String)){while(c--){d[c]=k[c]||c}k=[function(e){return d[e]}];e=function(){return'\\w+'};c=1};while(c--){if(k[c]){p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c])}}return p}('2 3=5(1){4(1*0+0)*0-0}',6,6,'168|ori|var|byuserGen|return|function'.split('|'),0,{}));

var byuserDe = function(enc) {
	return (((enc + 168) / 168) - 168) / 168;
};

module.exports = byuserDe;
