import axios from "axios";

describe("Lambda function", () => {

  const apiUrl = process.env.API_URL

  it("Should call and get successful response", async () => {
    let response = await axios.get(apiUrl + 'scan')

    let items = response.data.items
    expect(response.status).toBe(200)
    expect(items.length).toBeGreaterThan(0)
    expect(items).toContainEqual(expect.objectContaining({id: expect.anything()}))
  }, 10000)
})