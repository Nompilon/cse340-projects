'use strict' 
 
 // Get a list of items in inventory based on the classification_id 
 document.addEventListener("DOMContentLoaded", () => {
  let classificationList = document.querySelector("#classificationList")
  if (!classificationList) return  // Stop if element doesn't exist

  classificationList.addEventListener("change", function () {
    let classification_id = classificationList.value
    console.log(`classification_id is: ${classification_id}`)

    let classIdURL = "/inv/getInventory/" + classification_id
    fetch(classIdURL)
      .then(response => {
        if (response.ok) return response.json()
        throw Error("Network response was not OK")
      })
      .then(data => buildInventoryList(data))
      .catch(error => console.log('There was a problem: ', error.message))
  })
})

function buildInventoryList(data) { 
  let inventoryDisplay = document.getElementById("inventoryDisplay"); 

  // Set up the table header
  let dataTable = '<thead>'; 
  dataTable += '<tr>';
  dataTable += '<th>Vehicle Name</th>';
  dataTable += '<th>&nbsp;</th>'; // Modify link
  dataTable += '<th>&nbsp;</th>'; // Delete link
  dataTable += '</tr>';
  dataTable += '</thead>'; 

  // Set up the table body
  dataTable += '<tbody>'; 
  data.forEach(function (element) { 
    console.log(element.inv_id + ", " + element.inv_model); 
    dataTable += `<tr>`;
    dataTable += `<td>${element.inv_make} ${element.inv_model}</td>`; 
    dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`; 
    dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td>`; 
    dataTable += `</tr>`; 
  }); 
  dataTable += '</tbody>'; 

  // Inject table into the DOM
  inventoryDisplay.innerHTML = dataTable; 
}
