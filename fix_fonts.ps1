function Replace-FileContent {
    param (
        [string],
        [string],
        [string]
    )
    if (Test-Path ) {
         = Get-Content -Path  -Raw
        if ( -match ) {
             =  -replace , 
            Set-Content -Path  -Value  -NoNewline
            Write-Host "Updated "
        }
    }
}

# 1. Update font-display italic -> font-serif font-bold in admin pages
 = Get-ChildItem -Path "c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src\pages\admin" -Filter "*.jsx"
foreach ( in ) {
    Replace-FileContent -Path .FullName -Pattern "font-display italic" -Replacement "font-serif font-bold"
    Replace-FileContent -Path .FullName -Pattern "font-display font-bold" -Replacement "font-serif font-bold"
}

# 2. Update AdminConsolaSQL.jsx which has just text-3xl font-bold
Replace-FileContent -Path "c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src\pages\admin\AdminConsolaSQL.jsx" -Pattern 'className="text-3xl font-bold' -Replacement 'className="font-serif text-3xl font-bold'

# 3. Update Explorar.jsx 
Replace-FileContent -Path "c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src\pages\Explorar.jsx" -Pattern 'className="text-4xl' -Replacement 'className="font-serif text-4xl'

# 4. Update Proximamente.jsx
Replace-FileContent -Path "c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src\pages\Proximamente.jsx" -Pattern 'className="text-3xl font-bold' -Replacement 'className="font-serif text-3xl font-bold'

# 5. Fix ScrollMagicFeature.jsx background highlight
Replace-FileContent -Path "c:\Users\Arturo\Desktop\umsa\invierno26\PrjBD2\src\components\ScrollMagicFeature.jsx" -Pattern 'className=" bg-gradient-to-r from-purple-400 to-purple-600"' -Replacement 'className="text-purple-400"'

