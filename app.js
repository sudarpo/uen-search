var _SC_UEN = (function () {

	var MAX_RECORDS = 150;
	var DATA_GOV = "https://data.gov.sg/api/action/datastore_search?";
	var DATA_RESOURCEID_1 = "resource_id=39201285-b73e-487a-a971-3a12d34ab8d9"; // ACRA
	var DATA_RESOURCEID_2 = "resource_id=5ab68aac-91f6-4f39-9b21-698610bdf3f7"; // Other Issuance Agency
	var DS_ACRA = "ACRA";
	var DS_OTHERS = "OTHERS";
	var DATA_QS = "&limit=" + MAX_RECORDS + "&q=";
	
	$(function () {
		hideMessage(".result-message");
		hideLoading();
		hideErrorMessage();
		handleSearchButtonClick();
		
	});

	function handleSearchButtonClick() {
		$("#searchUenButton").on("click", function(e) {

			var isAcraSelected = $("#sourceAcra").prop("checked");
			var searchParam = {
				searchKeyword: $("#entityName").val().trim().toUpperCase(),
				dataSource: isAcraSelected ? DS_ACRA : DS_OTHERS,
				searchField: $("#searchField").val()
			}

			console.log("entityName", searchParam);

			if (searchParam.searchKeyword !== "") {
				searchByEntityName(searchParam);
			}
			
			e.preventDefault();
		});
	}
	
	function searchByEntityName(searchParam) {
		
		showLoading();
		hideErrorMessage();
		hideMessage(".result-message");

		var resourceUrl = getResourceUrl(searchParam);

		// Send ajax call
		console.log("Send ajax call", resourceUrl);
		$.ajax({
			method: "GET",
			url: resourceUrl,
			timeout: 30000
		})
		.fail(function(jqXHR, textStatus) {
			console.error("Request failed: ", textStatus, jqXHR);
			destroyAndCreateTable();
			showErrorMessage("Oops... Search return " + textStatus + ". Please try again later! <br/>");
		})
		.done(function(data) {
			displayResult(searchParam, data);
		})
		.always(function (data, textStatus) {
			hideLoading();
			console.log("Ajax Completed", textStatus);
		});
		
	}
	
	function getResourceUrl(searchParam) {

		// Define resource URL
		var resourceUrl = DATA_GOV;

		if (searchParam.dataSource === DS_ACRA) {
			resourceUrl += DATA_RESOURCEID_1;
		}
		else {
			resourceUrl += DATA_RESOURCEID_2;
		}

		var queryStr = '{"' + searchParam.searchField + '": "' + searchParam.searchKeyword + '"}';
		resourceUrl += DATA_QS + encodeURI(queryStr);
		
		return resourceUrl;

	}

	function destroyAndCreateTable() {
		$("#search-result").empty();
		var uenTable = $("<table>")
			.attr("id", "uen-table")
			.addClass("table table-striped table-bordered");
		$("#search-result").append($(uenTable));
	}

	function displayResult(searchParam, data) {
		if (data && data.success) {
			
			var message = "Search key: '" + searchParam.searchKeyword + "' by [" + searchParam.searchField + "] <br/>";

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
	
	function hideErrorMessage() {
		$(".sc-search-error").html("").hide();
	}

	function showErrorMessage(message) {
		$(".sc-search-error").html(message).show();
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
