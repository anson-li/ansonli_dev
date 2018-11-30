var mainText = [
  'Hey - I\'m Anson Li, and I <br class="hidden-xs hidden-md visible-lg"> built a <span class="highlight">modelling system</span><br class="hidden-xs hidden-md visible-lg"> for the Government of Alberta.',
  'Hey - I\'m Anson Li, and I <br class="hidden-xs hidden-md visible-lg"> designed a UX design <span class="highlight">every day</span><br class="hidden-xs hidden-md visible-lg"> for 100 days.',
  'Hey - I\'m Anson Li, and I <br class="hidden-xs hidden-md visible-lg"> developed a <span class="highlight">crude monitoring tool</span><br class="hidden-xs hidden-md visible-lg"> for CQI.',
  'Hey - I\'m Anson Li, and I <br class="hidden-xs hidden-md visible-lg"> developed a set of <span class="highlight">Ruby modules</span><br class="hidden-xs hidden-md visible-lg"> with Team Aqua.',
  'Hey - I\'m Anson Li, and I <br class="hidden-xs hidden-md visible-lg"> created an <span class="highlight">android application</span><br class="hidden-xs hidden-md visible-lg"> for trading cards.'
];

var subLink = [
  'albertames.html',
  'dailyui.html',
  'crudemonitor.html',
  'teamaqua.html',
  'sscte.html'
];

var randomItem = Math.floor( Math.random() * mainText.length);
$('#main-text').html(mainText[randomItem]);
$('#sub-link').attr("href", subLink[randomItem]);
