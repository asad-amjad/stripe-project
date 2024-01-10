let usersData = [
  {
    id: 1,
    login: "john_doe",
    name: "John Doe",
    avatar_url: "https://avatars.githubusercontent.com/u/1",
    bio: "Software Engineer",
    location: "San Francisco, CA",
    public_repos: 10,
    followers: 50,
    following: 30,
  },
  {
    id: 2,
    login: "jane_smith",
    name: "Jane Smith",
    avatar_url: "https://avatars.githubusercontent.com/u/2",
    bio: "Web Developer",
    location: "New York, NY",
    public_repos: 15,
    followers: 40,
    following: 25,
  },
];

const fetchRecordController = {
  fetchRecord: async (req, res) => {
    // console.log(req.body);
    res.json({ data: usersData, usage: req.body });
  },
};

module.exports = fetchRecordController;
