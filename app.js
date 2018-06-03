var _SC_UEN = (function () {

	var MAX_RECORDS = 150;
	var DATA_GOV = "https://data.gov.sg/api/action/datastore_search?";
	var DATA_RESOURCEID_1 = "resource_id=bdb377b8-096f-4f86-9c4f-85bad80ef93c"; // ACRA
	var DATA_RESOURCEID_2 = "resource_id=5ab68aac-91f6-4f39-9b21-698610bdf3f7"; // Other Issuance Agency
	var DATA_QS = "&limit=" + MAX_RECORDS + "&q=";
	
	$(function () {
		hideMessage(".result-message");
		hideLoading();
		handleSearchButtonClick();
		
	});

	function handleSearchButtonClick() {
		$("#searchUenButton").on("click", function(e) {
			var entityName = $("#entityName").val().trim();
			console.log("entityName", entityName);

			if (entityName !== "") {
				searchByEntityName(entityName.toUpperCase());
			}
			
			e.preventDefault();
		});
	}
	
	function searchByEntityName(entityName) {
		
		showLoading();
		hideMessage(".result-message");

		var resourceUrl = DATA_GOV;
		var isAcraSelected = $("#sourceAcra").prop("checked");

		if (isAcraSelected) {
			resourceUrl += DATA_RESOURCEID_1;
		}
		else {
			resourceUrl += DATA_RESOURCEID_2;
		}

		var queryStr = '{"entity_name": "' + entityName + '"}';
		resourceUrl += DATA_QS + encodeURI(queryStr);
		
		$.ajax({
			method: "GET",
			url: resourceUrl
		})
		.fail(function(jqXHR, textStatus) {
			console.error("Request failed: ", textStatus, jqXHR);
			// TODO: error handling
		})
		.done(function(data) {
			hideLoading();
			displayResult(entityName, data);
		});
		
	}
	
	function destroyAndCreateTable() {
		$("#search-result").empty();
		var uenTable = $("<table>")
			.attr("id", "uen-table")
			.addClass("table table-striped table-bordered");
		$("#search-result").append($(uenTable));
	}

	function displayResult(entityName, data) {
		if (data && data.success) {
			
			var message = "Search key: '" + entityName + "' <br/>";
			if (data.result.total) {
				message += data.result.total + " record(s) found. <br/>";
				if (data.result.total > MAX_RECORDS) {
					message += "Please refine your search ! Only " + MAX_RECORDS + " records will be displayed.";
				}
			}
			else {
				message += "No records found. ";
			}
			
			showMessage(".result-message", message);
			console.log( "Result: ", data.result );

			destroyAndCreateTable();
			$("#uen-table").DataTable( {
				"lengthMenu": [ 10, 25, 50, 75, 100, 200 ],
				"pageLength": 10,
				data: data.result.records,
				columns: [
					{ "data": "uen", "title": "UEN" },
					{ "data": "entity_name", "title": "Entity Name" },
					{ "data": "issuance_agency_id", "title":"Issuance Agency" },
					{ "data": "uen_status", "title":"UEN Status" },
					{ "data": "entity_type", "title":"Entity Type" },
					{ "data": "uen_issue_date", "title":"UEN Issue Date" },
					{ "data": "reg_street_name", "title":"Registered Street Name" },
					{ "data": "reg_postal_code", "title":"Registered Postal Code" }
				]
			} );
		}
	}
	
	function showMessage(id, message) {
		$(id).show().html(message);
	}

	function hideMessage(id) {
		$(id).hide().text("");
	}

	function showLoading() {
		$(".loading-text").show();
	}
	
	function hideLoading() {
		$(".loading-text").hide();
	}
	
	

})();