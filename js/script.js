(function(){

	'use strict';

	// Polyfill console in unsupported browser
	if (!window.console){ console = {log: function() {}} };

	// Initialise new APp
	var App = App || {};

	// Add basket method
	App.basket = function (){

		var	basketData = [],
			$basket = $('.basket__table > tbody'),
			$basketRows = $basket.find('tr'),
			$subtotal = $('.js-subtotal'),
			$vat = $('.js-vat'),
			$total = $('.js-total'),
			$submit = $('.js-submit');

		function mapBasketToArray(){

			// Convert server rendered table data to object
			$basketRows.each(function(){

				var unitId = $(this).find('.js-unit-id').val(),
					unitCost = $(this).find('.js-unit-cost').text()*1,
					unitQuantity = $(this).find('.js-unit-quantity').val()*1;

				var totalUnitCost = parseFloat(unitCost * unitQuantity);

				basketData[unitId] = {
					$el: $(this),
					cost: unitCost,
					quantity: unitQuantity,
					total: totalUnitCost
				}

			});
		}

		function rowBackgrounds(){
			// Add row classes for none nth-child supporting browsers
			$('.basket__table > tbody tr').removeClass('odd');
			$('.basket__table > tbody tr:nth-child(odd)').addClass('odd');
		}

		function toCurrency(num){

			return parseFloat(Math.round(num * 100) / 100).toFixed(2);
		
		}

		function updateBasket(){

			// Once there is a change to the data object handle and recalculate all fields and totals

			var id, vat = 0, subtotal = 0, total = 0;

			for(id in basketData){
				
				var unitTotal = parseFloat((basketData[id].quantity || 0) * basketData[id].cost);
				basketData[id].$el.find('.js-unit-total').text(toCurrency(unitTotal));
				subtotal += unitTotal;

			}

			vat = subtotal * 0.2;
			total = vat + subtotal;

			$subtotal.text(toCurrency(subtotal));
			$vat.text(toCurrency(vat));
			$total.text(toCurrency(total));

			// Hide submit if no total
			$submit.toggle(total > 0);

		}

		function handleQuantityIncrement(e){

			// Used instead of input[type='number'] for browser support
			// When user clicks on - || + increase of decrease input value and trigger keypress

			e.preventDefault();

			var $input = $(this).parents('tr').find('.js-unit-quantity'),
				dir = $(this).data('dir'),
				oldVal = $input.val()*1,
				newVal = Math.max(0, ((dir === 'up') ? oldVal+1 : oldVal-1));

			$input.val(newVal).trigger('keyup');

		}

		function handleQuantityChange(e){

			// Update row then trigger change on totals

			var unitId = $(this).parents('tr').find('.js-unit-id').val(),
				unitQuantity = $(this).val()*1;

			basketData[unitId].quantity = unitQuantity;
		
			updateBasket();

		}

		function handleRemove(e){

			// Remove item, with no JS working this will resolve to /remove_item/:id

			e.preventDefault();

			var $row = $(this).parents('tr'),
				unitId = $row.find('.js-unit-id').val();

			$row.fadeOut('slow', function(){
				$(this).remove();
				delete basketData[unitId];
				updateBasket();
				rowBackgrounds();
			});

		}

		function handleFormSubmit(e){

			e.preventDefault();

			// TODO: AJAX not currently posting data - probably due to lack of end point and JSON data type specicifity
			var data = $(this).serializeArray();

			console.log(data);

			$.ajax({
			  url: "",
			  type: 'POST',
			  data: data
			}).done(function() {
				alert('Success');
			}).fail(function() {
				// alert('An error occured in post');
			});
		}

		function init(){
			
			mapBasketToArray();
			rowBackgrounds();

			// When unit quantity is altered handle accordingly
			$('.basket__table')
				.on('click', '.js-unit-controls > a', handleQuantityIncrement)
				.on('keyup', '.js-unit-quantity', handleQuantityChange)
				.on('click', '.js-remove', handleRemove);
			
			$('.js-form').on('submit', handleFormSubmit);
		}

		return {
			init: init
		}
	}

	var basket = App.basket();
	basket.init();

})();