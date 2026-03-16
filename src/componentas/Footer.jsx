export default function Footer({ dark }) {
  return (
    <footer className={`border-t py-8 mt-auto text-center text-sm ${dark ? "border-gray-800 text-gray-600 bg-gray-950" : "border-stone-200 text-gray-400 bg-stone-50"}`}>
      <p>© 2025 FarmersAssistant · Made with ❤️ for Indian Farmers</p>
    </footer>
  );
}
