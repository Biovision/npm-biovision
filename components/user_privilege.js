const UserPrivilege = {
    initialized: false,
    selector: ".js-component-added-users",
    list: undefined,
    url: undefined,
    init: function () {
        this.list = document.querySelector(this.selector);
        if (this.list) {
            this.url = this.list.getAttribute("data-url");
            this.initialized = true;
        }
    },
    addUser: function (id) {
        if (UserPrivilege.url) {
            const data = {
                "user_id": id
            };
            const request = Biovision.jsonAjaxRequest(
                "patch",
                UserPrivilege.url,
                UserPrivilege.processAddResponse
            );

            request.send(JSON.stringify(data));
        } else {
            console.log("URL is not set for userPrivilege component")
        }
    },
    processAddResponse: function () {
        if (UserPrivilege.list) {
            const response = JSON.parse(this.responseText);
            if (response.hasOwnProperty("data")) {
                const data = response["data"];
                const li = document.createElement("li");
                const user = data["relationships"]["user"]["data"];
                const div = document.createElement("div");
                div.innerHTML = user["attributes"]["screen_name"] + " (" + user["meta"]["full_name"] + ")";
                li.append(div);

                const linkData = data["attributes"]["data"];
                if (Object.keys(linkData).length > 0) {
                    const details = document.createElement("div");
                    details.innerHTML = JSON.stringify(linkData);
                    li.append(details);
                }

                UserPrivilege.list.append(li);
            }
        } else {
            console.log("List is not defined for userPrivilege component");
        }
    }
};

export default UserPrivilege;
