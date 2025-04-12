# App Frontend

A React-based frontend for the Finance App, providing a user interface for account and transaction management.

## Features

//TODO: 

## Requirements

- Node.js 22.x or higher (if not installed: https://nodejs.org/en/download)
- npm or yarn
- API backend running on http://localhost:8000

## Docker Installation (Recommended)

For Docker deployment, use the Launcher project which provides a unified Docker Compose setup for the entire App Stack:

see https://github.com/MikeZ2001/ProjectWork-Launcher

## Standard Installation

1. Clone the repository:

```bash
git clone https://github.com/MikeZ2001/ProjectWork-FE.git
cd ProjectWork-FE
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Configure the API endpoint:

Create a `.env` file in the root directory (or edit it if it exists):

```bash
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env
```

4. Start the development server:

```bash
npm start
# or
yarn start
```

The application will be available at http://localhost:3000.

5. Building for Production (Optional)

To build the application for production:

```bash
npm run build
# or
yarn build
```

This will create a `build` directory with optimized production files.

## License

The App is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
