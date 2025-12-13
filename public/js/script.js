function validateInventory() {
    let isValid = true;
    const requiredFields = [
        "inv_make",
        "inv_model",
        "inv_year",
        "inv_description",
        "inv_image",
        "inv_thumbnail",
        "inv_price",
        "inv_miles",
        "inv_color",
        "classification_id"
    ];

    requiredFields.forEach(id => {
        const input = document.getElementById(id);
        const error = document.getElementById(id + "Error");
        if (!input.value.trim()) {
            error.textContent = "This field is required";
            isValid = false;
        } else {
            error.textContent = "";
        }
    });

    const year = document.getElementById("inv_year").value;
    const price = document.getElementById("inv_price").value;
    const miles = document.getElementById("inv_miles").value;

    if (isNaN(year) || year <= 1900 || year > new Date().getFullYear()) {
        document.getElementById("inv_yearError").textContent = "Enter a valid year";
        isValid = false;
    }
    if (isNaN(price) || price <= 0) {
        document.getElementById("inv_priceError").textContent = "Enter a valid price";
        isValid = false;
    }
    if (isNaN(miles) || miles < 0) {
        document.getElementById("inv_milesError").textContent = "Enter valid miles";
        isValid = false;
    }

    return isValid;
}


