export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex h-14 px-6 items-center justify-between text-sm text-muted-foreground">
        <a href="https://custherds.com/" rel="noopener noreferrer" className="hover:underline">
          <span>
            © {new Date().getFullYear()}{" "}
            <span className="font-medium text-foreground">Custherds</span>. All
            rights reserved.
          </span>
        </a>
        <span>
          Built with ❤️ by{" "}
          <span className="font-medium text-foreground">
            <a href="https://custherds.com/" rel="noopener noreferrer" className="hover:underline">Custherds</a>
          </span>
        </span>
      </div>
    </footer>
  )
}
