$("document").ready (function() {
  $(".toggle").click(function() {
    if ($('.menu').css('display') === 'none') {
      $( ".menulink" ).addClass('animated fadeInLeft');        
      //wait for animation to finish before removing classes
      window.setTimeout( function(){
          $( ".menulink" ).removeClass('animated fadeInLeft');
      }, 1000); 
    }
    $( ".menu" ).stop().slideToggle( "slow" );
  });
});
