import ProfileMenu from './ProfileMenu'

function Header({ navigate, showMessage }) {
  return (
    <header className="header">
      <div className="header-top">
        <ProfileMenu navigate={navigate} showMessage={showMessage} />
      </div>
    </header>
  )
}

export default Header
