export class Hyperbase {
    #baseUrl;
    #authToken;

    constructor(baseUrl: string) {
        this.#baseUrl = baseUrl
        this.#authToken = ""
    }

    get baseUrl() {
        return this.#baseUrl
    }

    get authToken() {
        return this.#authToken
    }

    async authenticate(tokenID: string, token: string, collectionID: string, authCredential: Map<string, any>) {
        const url = this.#baseUrl + "/api/rest/auth/token-based"

        const data = {
            "token_id": tokenID,
            "token": token,
            "collection_id": collectionID,
            "data": Object.fromEntries(authCredential.entries())
        }

        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })

        if (res.status != 200) {
            throw new Error("Not OK")
        }

        const resBody: HyperbaseRes<HyperbaseAuthRes> = await res.json()

        if (resBody.error != null) {
            throw new Error(JSON.stringify(resBody.error))
        }

        this.#authToken = resBody.data.token
    }

    setProject(projectId: string) {
        return new HyperbaseProject(this, projectId)
    }
}

export class HyperbaseProject {
    #hyperbase: Hyperbase
    #baseUrl: string

    constructor(hyperbase: Hyperbase, projectId: string) {
        this.#hyperbase = hyperbase
        this.#baseUrl = hyperbase.baseUrl + "/api/rest/project/" + projectId
    }

    get projectUrl() {
        return this.#baseUrl
    }

    get authToken() {
        return this.#hyperbase.authToken
    }

    setCollection(collectionId: string) {
        return new HyperbaseCollection(this, collectionId)
    }
}

export class HyperbaseCollection {
    #hyperbaseProject: HyperbaseProject
    #baseUrl: string

    constructor(hyperbaseProject: HyperbaseProject, collectionId: string) {
        this.#hyperbaseProject = hyperbaseProject
        this.#baseUrl = hyperbaseProject.projectUrl + "/collection/" + collectionId
    }

    async findMany<T>(data?: any) {
        const url = this.#baseUrl + "/records"

        let fields, filters, groups, orders, limit;

        if (data) {
            ({ fields, filters, groups, orders, limit } = data);
        }

        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                fields,
                filters,
                groups,
                orders,
                limit,
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.#hyperbaseProject.authToken}`,
            }
        });

        if (res.status != 200) {
            throw new Error("Not OK")
        }

        const resBody: HyperbaseRes<T> = await res.json()

        if (resBody.error != null) {
            throw new Error(JSON.stringify(resBody.error))
        }

        return resBody.data
    }
}

interface HyperbaseRes<T> {
    data: T
    error: HyperbaseErrorRes
}

interface HyperbaseErrorRes {
    status: string
    message: string
}

interface HyperbaseAuthRes {
    token: string
}