(function(global) {
    validate.field({
        isEmpty: function(response) {
            if (this.element.value === "") {
                this.element.setCustomValidity(response);
            }
        }
    });

    validate.rules(
        "sign-up-form",
        {
            "sign-up": [
                {
                    id: "FirstName",
                    message: {
                        id: "FirstNameMessage",
                        empty: "Please enter your first name",
                        invalid: "Please enter a valid first name"
                    }
                },
                {
                    id: "LastName",
                    message: {
                        id: "LastNameMessage",
                        empty: "Please enter your last name",
                        invalid: "Please enter a valid last name"
                    }
                },
                {
                    id: "Phone",
                    message: {
                        id: "PhoneMessage",
                        empty: "Please enter your phone number",
                        invalid: "Please enter a valid phone number"
                    }
                },
                {
                    id: "Email",
                    message: {
                        id: "EmailMessage",
                        empty: "Please enter your email address",
                        invalid: "Please enter a valid email address"
                    }
                },
                {
                    id: "ConfirmEmail",
                    message: {
                        id: "ConfirmEmailMessage",
                        empty: "Please enter your email address",
                        invalid: "Please enter a valid email address",
                        mismatch: "Please enter a matching email address"
                    }
                }
            ]
        },
        function(form) {
            form.select("sign-up", function(field) {
                field.on("blur", function() {
                    field.isEmpty(field.message.empty);
                    field.isInvalid(field.message.invalid);
                });
            });

            form.compare(
                form.select("Email").from("sign-up"),
                form.select("ConfirmEmail").from("sign-up"),
                function(e1, e2) {
                    this.on("blur", function() {
                        e2.matches(e1, e2.message.mismatch);
                    });
                }
            );
        }
    );
})(window);
